/**
 * Modelo de pagos: consulta de la tabla `pago`.
 */
import { getPool } from '../config/database.js'

/**
 * Lista todos los pagos, del más reciente al más antiguo.
 * @returns {Promise<object[]>} Filas con id, provider, amount, status y orderId.
 */
export const findAll = async () => {
  const [rows] = await getPool().query(`
    SELECT
      pa.idPago AS id,
      pa.proveedorPago AS provider,
      pa.monto AS amount,
      pa.estadoPago AS status,
      pa.idPedido AS orderId
    FROM pago pa
    ORDER BY pa.idPago DESC
  `)
  return rows
}
