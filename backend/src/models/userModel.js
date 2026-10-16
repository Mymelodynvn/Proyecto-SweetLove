// Modelo de usuarios: todas las consultas SQL sobre la tabla `usuario`
import { getPool } from '../config/database.js'

// Busca un usuario por correo (sin distinguir mayúsculas) incluyendo el hash de su contraseña, recibe email, db
export const findByEmail = async (email, db = getPool()) => {
  const [rows] = await db.query(
    'SELECT idUser, nombre, apellido, email, contrasena, idRol, emailVerificado, esInvitado FROM usuario WHERE LOWER(TRIM(email)) = ? LIMIT 1',
    [email],
  )
  return rows[0]
}

// Busca un usuario por identificador, sin exponer la contraseña, recibe idUser
export const findById = async (idUser) => {
  const [rows] = await getPool().query(
    'SELECT idUser, nombre, apellido, email, idRol FROM usuario WHERE idUser = ? LIMIT 1',
    [idUser],
  )
  return rows[0]
}

// Busca al dueño de una sesión incluyendo el hash de su contraseña (solo para comparar su huella), recibe idUser
export const findSessionUser = async (idUser) => {
  const [rows] = await getPool().query(
    'SELECT idUser, nombre, apellido, email, idRol, contrasena FROM usuario WHERE idUser = ? LIMIT 1',
    [idUser],
  )
  return rows[0]
}

// Busca un usuario por identificador incluyendo el hash de su contraseña (para cambiarla), recibe idUser
export const findByIdWithPassword = async (idUser) => {
  const [rows] = await getPool().query(
    'SELECT idUser, nombre, apellido, email, contrasena, idRol FROM usuario WHERE idUser = ? LIMIT 1',
    [idUser],
  )
  return rows[0]
}

// Crea un usuario con el rol indicado por nombre (p. ej. "Cliente"), recibe data, db
export const create = async (data, db = getPool()) => {
  const [result] = await db.execute(
    `INSERT INTO usuario (nombre, apellido, email, celular, direccion, contrasena, idRol, emailVerificado, esInvitado)
     VALUES (?, ?, ?, ?, ?, ?, (SELECT idRol FROM rol WHERE nombre = ? LIMIT 1), ?, ?)`,
    [
      data.nombre,
      data.apellido,
      data.email,
      data.celular ?? '',
      data.direccion ?? '',
      data.contrasenaHash,
      data.rol,
      data.emailVerificado === false ? 0 : 1,
      data.esInvitado ? 1 : 0,
    ],
  )
  return result.insertId
}

// Completa el celular y la dirección de una cuenta solo si los tiene vacíos (nunca sobrescribe datos existentes), recibe idUser, data, db
export const fillMissingContact = async (idUser, data, db = getPool()) => {
  await db.execute(
    `UPDATE usuario
     SET celular = IF(celular IS NULL OR celular = '', ?, celular),
         direccion = IF(direccion IS NULL OR direccion = '', ?, direccion)
     WHERE idUser = ?`,
    [data.celular ?? '', data.direccion ?? '', idUser],
  )
}

// Cambia la contraseña de una cuenta, recibe idUser, contrasenaHash
export const setPassword = async (idUser, contrasenaHash) => {
  await getPool().execute('UPDATE usuario SET contrasena = ? WHERE idUser = ?', [contrasenaHash, idUser])
}

// Activa una cuenta con una contraseña nueva: correo verificado y deja de ser cuenta de invitado, recibe idUser, contrasenaHash
export const activateWithPassword = async (idUser, contrasenaHash) => {
  await getPool().execute(
    'UPDATE usuario SET contrasena = ?, emailVerificado = 1, esInvitado = 0 WHERE idUser = ?',
    [contrasenaHash, idUser],
  )
}

// Marca el correo de una cuenta como verificado, recibe idUser
export const markEmailVerified = async (idUser) => {
  await getPool().execute('UPDATE usuario SET emailVerificado = 1 WHERE idUser = ?', [idUser])
}

// Lista los clientes con el total de pedidos y lo gastado (excluye pedidos cancelados)
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
