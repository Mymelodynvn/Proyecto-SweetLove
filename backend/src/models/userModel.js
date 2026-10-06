/**
 * Modelo de usuarios: todas las consultas SQL sobre la tabla `usuario`.
 * Los modelos solo hablan con la base de datos; las reglas de negocio viven
 * en servicios y controladores.
 */
import { getPool } from '../config/database.js'

/**
 * Busca un usuario por correo (sin distinguir mayúsculas) incluyendo el hash de su contraseña.
 * @param {string} email Correo ya normalizado en minúsculas.
 * @param {import('mysql2/promise').Pool|import('mysql2/promise').PoolConnection} [db] Conexión opcional (para transacciones).
 * @returns {Promise<object|undefined>} Fila del usuario o undefined si no existe.
 */
export const findByEmail = async (email, db = getPool()) => {
  const [rows] = await db.query(
    'SELECT idUser, nombre, apellido, email, contrasena, idRol FROM usuario WHERE LOWER(TRIM(email)) = ? LIMIT 1',
    [email],
  )
  return rows[0]
}

/**
 * Busca un usuario por identificador, sin exponer la contraseña.
 * @param {number} idUser Identificador del usuario.
 * @returns {Promise<object|undefined>} Datos públicos del usuario o undefined.
 */
export const findById = async (idUser) => {
  const [rows] = await getPool().query(
    'SELECT idUser, nombre, apellido, email, idRol FROM usuario WHERE idUser = ? LIMIT 1',
    [idUser],
  )
  return rows[0]
}

/**
 * Crea un usuario con el rol indicado por nombre (p. ej. "Cliente").
 * @param {object} data Datos del nuevo usuario.
 * @param {string} data.nombre Nombre.
 * @param {string} data.apellido Apellido.
 * @param {string} data.email Correo normalizado.
 * @param {string} [data.celular] Teléfono.
 * @param {string} [data.direccion] Dirección.
 * @param {string} data.contrasenaHash Hash bcrypt de la contraseña.
 * @param {string} data.rol Nombre del rol en la tabla `rol`.
 * @param {import('mysql2/promise').Pool|import('mysql2/promise').PoolConnection} [db] Conexión opcional.
 * @returns {Promise<number>} Identificador del usuario creado.
 */
export const create = async (data, db = getPool()) => {
  const [result] = await db.execute(
    `INSERT INTO usuario (nombre, apellido, email, celular, direccion, contrasena, idRol)
     VALUES (?, ?, ?, ?, ?, ?, (SELECT idRol FROM rol WHERE nombre = ? LIMIT 1))`,
    [data.nombre, data.apellido, data.email, data.celular ?? '', data.direccion ?? '', data.contrasenaHash, data.rol],
  )
  return result.insertId
}

/**
 * Actualiza los datos de contacto y entrega de un usuario existente.
 * @param {number} idUser Identificador del usuario.
 * @param {{nombre:string, apellido:string, celular:string, direccion:string}} data Nuevos datos.
 * @param {import('mysql2/promise').Pool|import('mysql2/promise').PoolConnection} [db] Conexión opcional.
 * @returns {Promise<void>}
 */
export const updateContact = async (idUser, data, db = getPool()) => {
  await db.execute('UPDATE usuario SET nombre = ?, apellido = ?, celular = ?, direccion = ? WHERE idUser = ?', [
    data.nombre,
    data.apellido,
    data.celular,
    data.direccion,
    idUser,
  ])
}

/**
 * Lista los clientes con el total de pedidos y lo gastado (excluye pedidos cancelados).
 * @returns {Promise<object[]>} Filas con id, name, email, phone, city, orderCount y totalSpent.
 */
export const findCustomersWithTotals = async () => {
  const [rows] = await getPool().query(`
    SELECT
      u.idUser AS id,
      CONCAT(u.nombre, ' ', u.apellido) AS name,
      u.email,
      u.celular AS phone,
      u.direccion AS city,
      COUNT(p.idPedido) AS orderCount,
      COALESCE(SUM(p.precioTotal), 0) AS totalSpent
    FROM usuario u
    LEFT JOIN pedido p ON p.idUser = u.idUser AND p.estadoPedido <> 'Cancelado'
    WHERE u.idRol = (SELECT idRol FROM rol WHERE nombre = 'Cliente' LIMIT 1)
    GROUP BY u.idUser, u.nombre, u.apellido, u.email, u.celular, u.direccion
    ORDER BY totalSpent DESC
  `)
  return rows
}
