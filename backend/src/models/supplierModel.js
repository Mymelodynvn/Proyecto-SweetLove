// Modelo de proveedores: consulta de la tabla `proveedor`
import { getPool } from '../config/database.js'

// Indica si existe un proveedor con ese identificador, recibe id
export const exists = async (id) => {
  const [rows] = await getPool().query('SELECT 1 FROM proveedor WHERE idProveedor = ? LIMIT 1', [id])
  return rows.length > 0
}

// Lista todos los proveedores
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
