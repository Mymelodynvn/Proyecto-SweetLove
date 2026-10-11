// Modelo de tokens de cuenta: enlaces de un solo uso para verificar el correo y restablecer la contraseña
import { getPool } from '../config/database.js'

// Guarda un token nuevo (solo su hash) con su vigencia en minutos, recibe idUser, tipo, tokenHash, minutes
export const create = async ({ idUser, tipo, tokenHash, minutes }) => {
  await getPool().execute(
    'INSERT INTO token_cuenta (idUser, tipo, tokenHash, expiraEn) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
    [idUser, tipo, tokenHash, minutes],
  )
}

// Busca un token que siga vigente y sin usar, y devuelve el usuario al que pertenece, recibe tipo, tokenHash
export const findValid = async (tipo, tokenHash) => {
  const [rows] = await getPool().query(
    `SELECT t.idToken, u.idUser, u.nombre, u.email, u.idRol
     FROM token_cuenta t INNER JOIN usuario u ON u.idUser = t.idUser
     WHERE t.tipo = ? AND t.tokenHash = ? AND t.usadoEn IS NULL AND t.expiraEn > NOW() LIMIT 1`,
    [tipo, tokenHash],
  )
  return rows[0]
}

// Gasta un token de forma atómica: devuelve true solo la primera vez que se usa, recibe idToken
export const consume = async (idToken) => {
  const [result] = await getPool().execute('UPDATE token_cuenta SET usadoEn = NOW() WHERE idToken = ? AND usadoEn IS NULL', [idToken])
  return result.affectedRows === 1
}

// Anula todos los tokens sin usar de un usuario de un tipo, recibe idUser, tipo
export const invalidateAll = async (idUser, tipo) => {
  await getPool().execute('UPDATE token_cuenta SET usadoEn = NOW() WHERE idUser = ? AND tipo = ? AND usadoEn IS NULL', [idUser, tipo])
}

// Cuenta los tokens que se pidieron en los últimos minutos (para no enviar correos sin límite), recibe idUser, tipo, minutes
export const countRecent = async (idUser, tipo, minutes) => {
  const [rows] = await getPool().query(
    'SELECT COUNT(*) AS total FROM token_cuenta WHERE idUser = ? AND tipo = ? AND creadoEn > DATE_SUB(NOW(), INTERVAL ? MINUTE)',
    [idUser, tipo, minutes],
  )
  return Number(rows[0].total)
}
