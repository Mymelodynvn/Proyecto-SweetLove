/**
 * Verifica que la API pueda comunicarse con la base de datos Sweet Love.
 * Esta ruta es útil para comprobar rápidamente la configuración local.
 */
import { getDatabase } from '../utils/db'

export default defineEventHandler(async () => {
  const database = getDatabase()
  await database.query('SELECT 1 AS conectado')
  return { ok: true, mensaje: 'API y base de datos conectadas correctamente.' }
})
