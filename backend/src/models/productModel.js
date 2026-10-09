// Modelo de productos: consultas SQL sobre la tabla `producto`
import { getPool } from '../config/database.js'

// Lista todo el catálogo ordenado por identificador
export const findAll = async () => {
  const [rows] = await getPool().query(`
    SELECT idProducto AS id, nombre AS name, descripcion AS description,
           precio AS price, cantidad AS stock, imagen AS image, estado AS active,
           idProveedor AS supplierId
    FROM producto
    ORDER BY idProducto
  `)
  return rows
}

// Obtiene un producto por identificador con los mismos alias que `findAll`, recibe id
export const findById = async (id) => {
  const [rows] = await getPool().query(
    `SELECT idProducto AS id, nombre AS name, descripcion AS description,
            precio AS price, cantidad AS stock, imagen AS image, estado AS active,
            idProveedor AS supplierId
     FROM producto WHERE idProducto = ?`,
    [id],
  )
  return rows[0]
}

// Inserta un producto nuevo (la imagen se asigna después con `setImage`), recibe data
export const create = async (data) => {
  const [result] = await getPool().execute(
    `INSERT INTO producto (nombre, descripcion, precio, cantidad, imagen, estado, idProveedor)
     VALUES (?, ?, ?, ?, NULL, ?, ?)`,
    [data.name, data.description, data.price, data.stock, data.active ? 1 : 0, data.supplierId],
  )
  return result.insertId
}

// Guarda la ruta de la imagen de un producto, recibe id, imagePath
export const setImage = async (id, imagePath) => {
  await getPool().execute('UPDATE producto SET imagen = ? WHERE idProducto = ?', [imagePath, id])
}

// Actualiza todos los campos editables de un producto, recibe id, data
export const update = async (id, data) => {
  const [result] = await getPool().execute(
    `UPDATE producto
     SET nombre = ?, descripcion = ?, precio = ?, cantidad = ?, imagen = ?, estado = ?, idProveedor = ?
     WHERE idProducto = ?`,
    [data.name, data.description, data.price, data.stock, data.image, data.active ? 1 : 0, data.supplierId, id],
  )
  return result.affectedRows
}

// Elimina un producto, recibe id
export const remove = async (id) => {
  const [result] = await getPool().execute('DELETE FROM producto WHERE idProducto = ?', [id])
  return result.affectedRows
}

// Lee un producto y lo bloquea (FOR UPDATE) para que dos pedidos no descuenten el mismo stock, recibe connection, id
export const lockForSale = async (connection, id) => {
  const [rows] = await connection.query(
    'SELECT idProducto, nombre, precio, cantidad, estado FROM producto WHERE idProducto = ? FOR UPDATE',
    [id],
  )
  return rows[0]
}

// Descuenta unidades vendidas del inventario, recibe connection, id, quantity
export const decreaseStock = async (connection, id, quantity) => {
  await connection.execute('UPDATE producto SET cantidad = cantidad - ? WHERE idProducto = ?', [quantity, id])
}
