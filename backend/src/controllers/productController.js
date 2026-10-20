// Controlador de productos: catálogo público y administración (crear, editar, eliminar)
import { HttpError } from '../utils/httpError.js'
import { cleanText, parseIntInRange, parsePositiveInt } from '../utils/validate.js'
import { isImageDataUrl, parseImageReference, saveProductImage } from '../utils/product-image.js'
import * as productModel from '../models/productModel.js'
import * as supplierModel from '../models/supplierModel.js'

// Largos máximos de las columnas `producto.nombre` y `producto.descripcion` (ver database/schema.sql)
const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 255
// Valores máximos (las columnas son INT; estos topes evitan errores del motor y precios o stocks absurdos)
const MAX_PRICE = 99999999
const MAX_STOCK = 99999

// Imagen de un producto que todavía no tiene una propia (el logo: nunca la foto de otro producto)
const DEFAULT_IMAGE = '/tienda/assets/recursos/logo1.png'

// Convierte una fila de producto en la forma que consumen la tienda y el panel, recibe row
const toProductResponse = (row) => ({
  ...row,
  active: Boolean(row.active),
  emoji: '🍰',
  category: 'Repostería',
  rating: '—',
  image: row.image || DEFAULT_IMAGE,
})

// Lee y valida los campos de un producto enviados por el administrador; al editar (partial), lo que no se envía queda sin tocar (undefined), recibe body, partial
const parseProductBody = async (body = {}, partial = false) => {
  const name = cleanText(body.name)
  if (!name) throw new HttpError(400, 'Nombre, precio y stock son obligatorios.')
  if (name.length > MAX_NAME_LENGTH) throw new HttpError(400, `El nombre admite máximo ${MAX_NAME_LENGTH} caracteres.`)

  let description = partial ? undefined : ''
  if (body.description !== undefined) {
    description = cleanText(body.description)
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new HttpError(400, `La descripción admite máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`)
    }
  }

  // Solo se acepta verdadero o falso: un texto como "false" no puede dejar el producto activo por error
  let active = partial ? undefined : true
  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') throw new HttpError(400, 'El estado del producto debe ser verdadero o falso.')
    active = body.active
  }

  let supplierId = partial ? undefined : null
  if (body.supplierId !== undefined) {
    supplierId = body.supplierId === null ? null : parsePositiveInt(body.supplierId, 'El proveedor')
    if (supplierId !== null && !(await supplierModel.exists(supplierId))) throw new HttpError(400, 'El proveedor no existe.')
  }

  return {
    name,
    description,
    price: parseIntInRange(body.price, 'El precio', 1, MAX_PRICE),
    stock: parseIntInRange(body.stock, 'El stock', 0, MAX_STOCK),
    active,
    supplierId,
  }
}

// GET /api/products — catálogo completo (público, lo usa la tienda), recibe res
export const list = async (_req, res) => {
  res.json((await productModel.findAll()).map(toProductResponse))
}

// POST /api/products — crea un producto (solo administrador), recibe req, res
export const create = async (req, res) => {
  const data = await parseProductBody(req.body)
  // La imagen se valida antes de crear el producto, para no dejar uno a medias si es inválida
  const image = parseImageReference(req.body.image)
  const id = await productModel.create(data)

  // Archivo subido: se guarda como archivo; URL o ruta: se guarda tal cual
  if (image) await productModel.setImage(id, isImageDataUrl(image) ? await saveProductImage(image, id) : image)

  res.status(201).json({ producto: await productModel.findById(id) })
}

// PUT /api/products/:id — actualiza un producto (solo administrador), recibe req, res
export const update = async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'El identificador de producto')
  const data = await parseProductBody(req.body, true)

  // Sin el campo image la imagen se conserva; con null o vacío se quita
  let image = req.body.image === undefined ? undefined : parseImageReference(req.body.image)
  if (image && isImageDataUrl(image)) image = await saveProductImage(image, id)

  const affected = await productModel.update(id, { ...data, image })
  if (!affected && !(await productModel.findById(id))) throw new HttpError(404, 'El producto no existe.')

  res.json({ ok: true })
}

// DELETE /api/products/:id — elimina un producto (solo administrador), recibe req, res
export const remove = async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'El identificador de producto')
  if (!(await productModel.remove(id))) throw new HttpError(404, 'El producto no existe.')
  res.json({ ok: true })
}
