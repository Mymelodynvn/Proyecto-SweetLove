// Configuración central del backend
import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production'

// Secreto con el que se firma la cookie de sesión (mínimo 32 caracteres)
const sessionSecret =
  process.env.SESSION_SECRET ||
  // Solo en desarrollo/pruebas se permite un valor por defecto.
  (isProduction ? '' : 'dev-only-secret-change-me-0123456789abcdef')

if (sessionSecret.length < 32) {
  throw new Error('Configuración incompleta: define SESSION_SECRET con al menos 32 caracteres.')
}

// Convierte una lista "a,b,c" de la variable CORS_ORIGIN en un arreglo limpio
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
  // Mercado Pago (Checkout Pro): el Access Token es secreto y solo vive en el backend
  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    webhookSecret: process.env.MP_WEBHOOK_SECRET || '',
    currencyId: process.env.MP_CURRENCY_ID || 'COP',
    // Adonde vuelve el cliente después de pagar (la tienda)
    frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, ''),
    // Adonde Mercado Pago envía los avisos de pago; vacío en local (debe ser una URL pública)
    backendPublicUrl: (process.env.BACKEND_PUBLIC_URL || '').replace(/\/+$/, ''),
  },
})
