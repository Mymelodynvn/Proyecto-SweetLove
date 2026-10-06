/**
 * Modelo de proveedores: consulta de la tabla `proveedor`.
 */
import { getPool } from '../config/database.js'

/**
 * Lista todos los proveedores.
 * @returns {Promise<object[]>} Filas con id, name, email, phone y userId.
 */
export const findAll = async () => {
  const [rows] = await getPool().query(`
    SELECT
      idProveedor AS id,
      nombre AS name,
      email,
      celular AS phone,
      idUser AS userId
    FROM proveedor
    ORDER BY idProveedor
  `)
  return rows
}
