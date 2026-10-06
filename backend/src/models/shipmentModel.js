/**
 * Modelo de envíos: consulta de `envio` junto con su estado descriptivo (`estadoenvio`).
 */
import { getPool } from '../config/database.js'

/**
 * Lista los envíos, del más reciente al más antiguo.
 * @returns {Promise<object[]>} Filas con id, paymentId, statusId y status.
 */
export const findAll = async () => {
  const [rows] = await getPool().query(`
    SELECT
      e.idEnvio AS id,
      e.idPago AS paymentId,
      e.idEstado AS statusId,
      ee.nombre AS status
    FROM envio e
    LEFT JOIN estadoenvio ee ON ee.idEstado = e.idEstado
    ORDER BY e.idEnvio DESC
  `)
  return rows
}
