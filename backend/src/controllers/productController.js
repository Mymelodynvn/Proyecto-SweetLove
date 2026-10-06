/**
 * Controlador de productos: catálogo público y administración (crear, editar, eliminar).
 */
import { HttpError } from '../utils/httpError.js'
import { cleanText, parseNonNegativeInt, parsePositiveInt } from '../utils/validate.js'
import { isImageDataUrl, saveProductImage } from '../utils/product-image.js'
import * as productModel from '../models/productModel.js'

/** Imágenes de la tienda para los productos de ejemplo cuando la base aún no tiene imagen propia. */
const FALLBACK_IMAGE_BY_ID = {
  1: '/tienda/assets/images/trufas.jpeg',
  2: '/tienda/assets/images/combox3.jpeg',
  3: '/tienda/assets/images/maryuri.jpeg',
  4: '/tienda/assets/images/fresas.jpeg',
}
/** Largos máximos de las columnas `producto.nombre` y `producto.descripcion` (ver database/schema.sql). */
const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 255

const DEFAULT_IMAGE = '/tienda/assets/recursos/logo1.png'

/**
 * Convierte una fila de producto en la forma que consumen la tienda y el panel.
 * Prioriza la imagen guardada en la base; si no hay, usa la de ejemplo o el logo.
 * @param {object} row Producto devuelto por el modelo.
 * @returns {object} Producto con emoji, categoría, rating e imagen resueltos.
 */
const toProductResponse = (row) => ({
  ...row,
  active: Boolean(row.active),
  emoji: '🍰',
  category: 'Repostería',
  rating: '—',
  image: row.image || FALLBACK_IMAGE_BY_ID[row.id] || DEFAULT_IMAGE,
})

/**
 * Lee y valida los campos de un producto enviados por el administrador.
 * @param {object} body Cuerpo de la petición.
 * @returns {{name:string, description:string, price:number, stock:number, active:boolean, supplierId:number|null}} Datos limpios.
 */
const parseProductBody = (body = {}) => {
  const name = cleanText(body.name)
  if (!name) throw new HttpError(400, 'Nombre, precio y stock son obligatorios.')
  if (name.length > MAX_NAME_LENGTH) throw new HttpError(400, `El nombre admite máximo ${MAX_NAME_LENGTH} caracteres.`)

  const description = cleanText(body.description)
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new HttpError(400, `La descripción admite máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`)
  }

  return {
    name,
    description,
    price: parseNonNegativeInt(body.price, 'El precio'),
    stock: parseNonNegativeInt(body.stock, 'El stock'),
    active: body.active !== false,
    supplierId: body.supplierId == null ? null : parsePositiveInt(body.supplierId, 'El proveedor'),
  }
}

/**
 * GET /api/products — catálogo completo (público, lo usa la tienda).
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta con la lista de productos.
 * @returns {Promise<void>}
 */
export const list = async (_req, res) => {
  res.json((await productModel.findAll()).map(toProductResponse))
}

/**
 * POST /api/products — crea un producto (solo administrador).
 * Si llega una imagen en base64 se guarda como archivo y se registra su ruta.
 * @param {import('express').Request} req Petición con los datos del producto.
 * @param {import('express').Response} res Respuesta con el producto creado.
 * @returns {Promise<void>}
 */
export const create = async (req, res) => {
  const data = parseProductBody(req.body)
  const id = await productModel.create(data)

  if (isImageDataUrl(req.body.image)) {
    await productModel.setImage(id, await saveProductImage(req.body.image, id))
  }

  res.status(201).json({ producto: await productModel.findById(id) })
}

/**
 * PUT /api/products/:id — actualiza un producto (solo administrador).
 * Una imagen nueva en base64 se guarda como archivo; una ruta existente se conserva.
 * @param {import('express').Request} req Petición con :id y los nuevos datos.
 * @param {import('express').Response} res Respuesta `{ ok: true }`.
 * @returns {Promise<void>}
 */
export const update = async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'El identificador de producto')
  const data = parseProductBody(req.body)

  let image = req.body.image ?? null
  if (isImageDataUrl(image)) image = await saveProductImage(image, id)

  const affected = await productModel.update(id, { ...data, image })
  if (!affected && !(await productModel.findById(id))) throw new HttpError(404, 'El producto no existe.')

  res.json({ ok: true })
}

/**
 * DELETE /api/products/:id — elimina un producto (solo administrador).
 * Si tiene pedidos asociados, MySQL lo impide y el manejador de errores responde 409.
 * @param {import('express').Request} req Petición con :id.
 * @param {import('express').Response} res Respuesta `{ ok: true }`.
 * @returns {Promise<void>}
 */
export const remove = async (req, res) => {
  const id = parsePositiveInt(req.params.id, 'El identificador de producto')
  if (!(await productModel.remove(id))) throw new HttpError(404, 'El producto no existe.')
  res.json({ ok: true })
}
