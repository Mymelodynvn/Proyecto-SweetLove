// Modelo de mensajes de contacto: consultas sobre la tabla `mensaje_contacto`
import { getPool } from '../config/database.js'

// Lista los mensajes del más reciente al más antiguo; la fecha sale en UTC como "YYYY-MM-DDTHH:MM:SSZ" y el navegador la muestra en su hora local
export const findAll = async () => {
  const [rows] = await getPool().query(`
    SELECT
      idMensaje AS id,
      nombre AS name,
      celular AS phone,
      asunto AS subject,
      mensaje AS message,
      DATE_FORMAT(creadoEn, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
    FROM mensaje_contacto
    ORDER BY creadoEn DESC, idMensaje DESC
  `)
  return rows
}

// Guarda un mensaje nuevo (con la hora en UTC, sin depender de la zona horaria de la base) y devuelve su identificador, recibe data
export const create = async (data) => {
  const [result] = await getPool().execute(
    'INSERT INTO mensaje_contacto (nombre, celular, asunto, mensaje, creadoEn) VALUES (?, ?, ?, ?, UTC_TIMESTAMP())',
    [data.name, data.phone, data.subject, data.message],
  )
  return result.insertId
}

// Elimina un mensaje; devuelve cuántas filas se borraron (0 si no existía), recibe id
export const remove = async (id) => {
  const [result] = await getPool().execute('DELETE FROM mensaje_contacto WHERE idMensaje = ?', [id])
  return result.affectedRows
}
