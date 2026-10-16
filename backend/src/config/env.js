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

// Correo desde el que se envía: el de SMTP o, si no hay, el de la API de Gmail (Gmail solo deja enviar con la cuenta autenticada)
const senderAddress = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim()

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
  // URL pública de la tienda: a donde vuelve el cliente y a donde apuntan los enlaces de los correos
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  // Minutos que un pedido con Mercado Pago espera su pago antes de cancelarse y devolver el stock
  orderTtlMinutes: Number(process.env.ORDER_TTL_MINUTES || 30),
  // Correo: por el puente de Apps Script si hay MAIL_RELAY_*, por la API de Gmail si hay GMAIL_*, por SMTP si hay SMTP_*, por Resend si hay RESEND_API_KEY;
  // con MAIL_TRANSPORT=memory (pruebas) se guarda en memoria
  mail: {
    // Puente con Google Apps Script: un script de tu cuenta de Google envía el correo; no vence y sirve en Render gratis
    relay: {
      url: (process.env.MAIL_RELAY_URL || '').trim(),
      secret: (process.env.MAIL_RELAY_SECRET || '').trim(),
    },
    // API de Gmail (OAuth): funciona donde el SMTP está bloqueado, como Render gratis; el refresh token se obtiene con `npm run gmail:token`
    gmail: {
      clientId: (process.env.GMAIL_CLIENT_ID || '').trim(),
      clientSecret: (process.env.GMAIL_CLIENT_SECRET || '').trim(),
      refreshToken: (process.env.GMAIL_REFRESH_TOKEN || '').trim(),
    },
    // SMTP: por defecto Gmail con una contraseña de aplicación (los espacios que muestra Google se ignoran)
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      user: (process.env.SMTP_USER || '').trim(),
      password: (process.env.SMTP_PASSWORD || '').replace(/\s+/g, ''),
    },
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.MAIL_FROM || (senderAddress ? `Sweet Love <${senderAddress}>` : 'Sweet Love <onboarding@resend.dev>'),
    transport: process.env.MAIL_TRANSPORT || '',
    // Dirección pública del logo que se muestra en los correos (vacía: se usa el de la tienda en FRONTEND_URL)
    logoUrl: (process.env.EMAIL_LOGO_URL || '').trim(),
  },
  // Mercado Pago (Checkout Pro): el Access Token es secreto y solo vive en el backend
  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    webhookSecret: process.env.MP_WEBHOOK_SECRET || '',
    currencyId: process.env.MP_CURRENCY_ID || 'COP',
    // Adonde Mercado Pago envía los avisos de pago; vacío en local (debe ser una URL pública)
    backendPublicUrl: (process.env.BACKEND_PUBLIC_URL || '').replace(/\/+$/, ''),
  },
})
