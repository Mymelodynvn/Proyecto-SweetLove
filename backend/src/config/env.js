/**
 * Configuración central del backend.
 * Lee las variables de entorno (archivo .env) una sola vez y las expone en un
 * objeto inmutable. Si falta algo crítico para producción, el servidor se
 * detiene al arrancar en lugar de fallar más tarde con errores confusos.
 */
import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production'

/** Secreto con el que se firma la cookie de sesión (mínimo 32 caracteres). */
const sessionSecret =
  process.env.SESSION_SECRET ||
  // Solo en desarrollo/pruebas se permite un valor por defecto.
  (isProduction ? '' : 'dev-only-secret-change-me-0123456789abcdef')

if (sessionSecret.length < 32) {
  throw new Error('Configuración incompleta: define SESSION_SECRET con al menos 32 caracteres.')
}

/** Convierte una lista "a,b,c" de la variable CORS_ORIGIN en un arreglo limpio. */
const parseList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const config = Object.freeze({
  isProduction,
  port: Number(process.env.PORT || 4000),
  sessionSecret,
  corsOrigins: parseList(process.env.CORS_ORIGIN),
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    name: process.env.DATABASE_NAME || 'sweetlove',
    // true para bases en la nube (TiDB Cloud, Aiven, PlanetScale...) que exigen conexión cifrada.
    ssl: process.env.DATABASE_SSL === 'true',
  },
})
