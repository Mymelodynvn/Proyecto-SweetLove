/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Obtiene los envíos junto con el pedido y el estado descriptivo.
 */
import { getDatabase } from '../utils/db'

export default defineEventHandler(async () => {
  const database = getDatabase()
  const [rows] = await database.query(`
    SELECT
      e.idEnvio AS id,
      e.idPago AS paymentId,
      e.idEstado AS statusId,
      ee.nombre AS status
    FROM envio e
    LEFT JOIN estadoenvio ee ON ee.idEstado = e.idEstado
    ORDER BY e.idEnvio DESC
  `)

  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: Number(row.id),
    paymentId: Number(row.paymentId ?? 0),
    statusId: Number(row.statusId ?? 0),
    status: String(row.status ?? 'Pendiente'),
  }))
})
