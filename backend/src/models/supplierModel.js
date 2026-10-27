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

// Inserta un proveedor nuevo, recibe data
export const create = async (data) => {
  const [result] = await getPool().execute(
    'INSERT INTO proveedor (nombre, email, celular) VALUES (?, ?, ?)',
    [data.name, data.email, data.phone],
  )
  return result.insertId
}

// Columnas de `proveedor` que se pueden editar y el campo de `data` que las llena
const EDITABLE_COLUMNS = { name: 'nombre', email: 'email', phone: 'celular' }

// Actualiza solo los campos que vienen en data: lo que no se envía (undefined) se conserva; null borra el valor, recibe id, data
export const update = async (id, data) => {
  const sets = []
  const values = []
  for (const [field, column] of Object.entries(EDITABLE_COLUMNS)) {
    if (data[field] === undefined) continue
    sets.push(`${column} = ?`)
    values.push(data[field])
  }
  if (!sets.length) return 0

  const [result] = await getPool().execute(`UPDATE proveedor SET ${sets.join(', ')} WHERE idProveedor = ?`, [...values, id])
  return result.affectedRows
}

// Elimina un proveedor; los productos que lo tenían quedan sin proveedor (ON DELETE SET NULL), recibe id
export const remove = async (id) => {
  const [result] = await getPool().execute('DELETE FROM proveedor WHERE idProveedor = ?', [id])
  return result.affectedRows
}
