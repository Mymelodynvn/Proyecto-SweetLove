/**
 * Modelo de productos: consultas SQL sobre la tabla `producto`.
 */
import { getPool } from '../config/database.js'

/**
 * Lista todo el catálogo ordenado por identificador.
 * @returns {Promise<object[]>} Productos con id, name, description, price, stock, image, active y supplierId.
 */
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

/**
 * Obtiene un producto por identificador con los mismos alias que `findAll`.
 * @param {number} id Identificador del producto.
 * @returns {Promise<object|undefined>} El producto o undefined si no existe.
 */
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

/**
 * Inserta un producto nuevo (la imagen se asigna después con `setImage`).
 * @param {{name:string, description:string, price:number, stock:number, active:boolean, supplierId:number|null}} data Datos del producto.
 * @returns {Promise<number>} Identificador del producto creado.
 */
export const create = async (data) => {
  const [result] = await getPool().execute(
    `INSERT INTO producto (nombre, descripcion, precio, cantidad, imagen, estado, idProveedor)
     VALUES (?, ?, ?, ?, NULL, ?, ?)`,
    [data.name, data.description, data.price, data.stock, data.active ? 1 : 0, data.supplierId],
  )
  return result.insertId
}

/**
 * Guarda la ruta de la imagen de un producto.
 * @param {number} id Identificador del producto.
 * @param {string|null} imagePath Ruta pública de la imagen o null.
 * @returns {Promise<void>}
 */
export const setImage = async (id, imagePath) => {
  await getPool().execute('UPDATE producto SET imagen = ? WHERE idProducto = ?', [imagePath, id])
}

/**
 * Actualiza todos los campos editables de un producto.
 * @param {number} id Identificador del producto.
 * @param {{name:string, description:string, price:number, stock:number, image:string|null, active:boolean, supplierId:number|null}} data Nuevos valores.
 * @returns {Promise<number>} Filas afectadas (0 si el producto no existe).
 */
export const update = async (id, data) => {
  const [result] = await getPool().execute(
    `UPDATE producto
     SET nombre = ?, descripcion = ?, precio = ?, cantidad = ?, imagen = ?, estado = ?, idProveedor = ?
     WHERE idProducto = ?`,
    [data.name, data.description, data.price, data.stock, data.image, data.active ? 1 : 0, data.supplierId, id],
  )
  return result.affectedRows
}

/**
 * Elimina un producto. MySQL rechaza el borrado si tiene pedidos asociados.
 * @param {number} id Identificador del producto.
 * @returns {Promise<number>} Filas eliminadas (0 si no existía).
 */
export const remove = async (id) => {
  const [result] = await getPool().execute('DELETE FROM producto WHERE idProducto = ?', [id])
  return result.affectedRows
}

/**
 * Lee un producto y lo bloquea (`FOR UPDATE`) dentro de una transacción
 * para que dos pedidos simultáneos no descuenten el mismo stock.
 * @param {import('mysql2/promise').PoolConnection} connection Conexión con transacción abierta.
 * @param {number} id Identificador del producto.
 * @returns {Promise<{idProducto:number, precio:number, cantidad:number, estado:number}|undefined>} Producto bloqueado.
 */
export const lockForSale = async (connection, id) => {
  const [rows] = await connection.query(
    'SELECT idProducto, precio, cantidad, estado FROM producto WHERE idProducto = ? FOR UPDATE',
    [id],
  )
  return rows[0]
}

/**
 * Descuenta unidades vendidas del inventario.
 * @param {import('mysql2/promise').PoolConnection} connection Conexión con transacción abierta.
 * @param {number} id Identificador del producto.
 * @param {number} quantity Unidades a descontar.
 * @returns {Promise<void>}
 */
export const decreaseStock = async (connection, id, quantity) => {
  await connection.execute('UPDATE producto SET cantidad = cantidad - ? WHERE idProducto = ?', [quantity, id])
}
