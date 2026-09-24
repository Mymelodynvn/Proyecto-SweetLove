/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Actualiza los campos editables de un producto existente.
 */
import { getDatabase } from '../../utils/db'
import { saveProductImage } from '../../utils/product-image'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    name?: string; description?: string; price?: number; stock?: number; image?: string | null; active?: boolean; supplierId?: number | null
  }>(event)

  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'Identificador de producto inválido.' })

  const database = getDatabase()
  let imageValue = body.image ?? null
  if (typeof imageValue === 'string' && imageValue.startsWith('data:image/')) {
    imageValue = await saveProductImage(imageValue, id)
  }
  await database.execute(
    `UPDATE producto
     SET nombre = ?, descripcion = ?, precio = ?, cantidad = ?, imagen = ?, estado = ?, idProveedor = ?
     WHERE idProducto = ?`,
    [body.name, body.description ?? '', Number(body.price), Number(body.stock), imageValue, body.active === false ? 0 : 1, body.supplierId ?? null, id],
  )

  return { ok: true }
})
