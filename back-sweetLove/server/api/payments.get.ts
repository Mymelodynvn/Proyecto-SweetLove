/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Obtiene los pagos registrados y los relaciona con su pedido.
 */
import { getDatabase } from '../utils/db'

export default defineEventHandler(async () => {
  const database = getDatabase()
  const [rows] = await database.query(`
    SELECT
      pa.idPago AS id,
      pa.proveedorPago AS provider,
      pa.monto AS amount,
      pa.estadoPago AS status,
      pa.idPedido AS orderId
    FROM pago pa
    ORDER BY pa.idPago DESC
  `)

  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: Number(row.id),
    provider: String(row.provider ?? 'No especificado'),
    amount: Number(row.amount ?? 0),
    status: String(row.status ?? 'Pendiente'),
    orderId: Number(row.orderId ?? 0),
  }))
})
