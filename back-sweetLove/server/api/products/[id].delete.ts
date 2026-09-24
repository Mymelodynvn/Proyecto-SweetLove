/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Elimina un producto que no tenga dependencias activas en pedidos.
 */
import { getDatabase } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const database = getDatabase()

  try {
    await database.execute('DELETE FROM producto WHERE idProducto = ?', [id])
    return { ok: true }
  } catch {
    throw createError({ statusCode: 409, statusMessage: 'No se puede eliminar el producto porque está relacionado con pedidos.' })
  }
})
