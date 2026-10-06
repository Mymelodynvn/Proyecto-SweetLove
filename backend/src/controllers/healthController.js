/**
 * Controlador de salud: permite comprobar que la API y la base de datos responden.
 * Render y otros hosts lo usan como "health check".
 */
import { getPool } from '../config/database.js'

/**
 * GET /api/health — ejecuta una consulta mínima para confirmar la conexión a MySQL.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta `{ ok: true }` si la base responde.
 * @returns {Promise<void>}
 */
export const check = async (_req, res) => {
  await getPool().query('SELECT 1 AS conectado')
  res.json({ ok: true, mensaje: 'API y base de datos conectadas correctamente.' })
}
