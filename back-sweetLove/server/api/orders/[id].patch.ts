/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Actualiza el estado de un pedido en la tabla pedido.
 */
import { getDatabase } from '../../utils/db'

const toDatabaseStatus: Record<string, string> = {
  Pendiente: 'Pendiente',
  'En preparación': 'En preparación',
  Enviado: 'Enviado',
  Completado: 'Completado',
  Cancelado: 'Cancelado',
}

export default defineEventHandler(async (event) => {
  const id = String(getRouterParam(event, 'id')).replace('#SL', '').replace(/^0+/, '')
  const body = await readBody<{ status?: string }>(event)
  const nextStatus = body.status ? toDatabaseStatus[body.status] : undefined
  if (!nextStatus) throw createError({ statusCode: 400, statusMessage: 'Estado de pedido inválido.' })

  const database = getDatabase()
  await database.execute('UPDATE pedido SET estadoPedido = ? WHERE idPedido = ?', [nextStatus, Number(id)])
  return { ok: true }
})
