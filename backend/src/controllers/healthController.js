// Controlador de salud: permite comprobar que la API y la base de datos responden
import { getPool } from '../config/database.js'

// GET /api/health — ejecuta una consulta mínima para confirmar la conexión a MySQL, recibe res
export const check = async (_req, res) => {
  await getPool().query('SELECT 1 AS conectado')
  res.json({ ok: true, mensaje: 'API y base de datos conectadas correctamente.' })
}
