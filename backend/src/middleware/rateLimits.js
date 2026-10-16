// Límites de intentos por ruta (frenan contraseñas adivinadas, correos sin fin y pedidos en masa)
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

const tooManyAttempts = { error: true, statusCode: 429, statusMessage: 'Demasiados intentos. Intenta de nuevo en unos minutos.' }

// Normaliza el correo del cuerpo de la petición para usarlo como clave del límite, recibe req
const emailKey = (req) => String(req.body?.email ?? '').trim().toLowerCase()

// Limita los intentos fallidos de login por correo (no por IP: detrás del proxy de Render todos los usuarios comparten la misma IP)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => emailKey(req) || ipKeyGenerator(req.ip),
  message: tooManyAttempts,
})

// Limita los registros por IP para frenar el spam de cuentas
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyAttempts,
})

// Limita los correos de recuperación y verificación por correo y por hora (evita enviar correos sin fin)
export const mailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `mail:${emailKey(req) || ipKeyGenerator(req.ip)}`,
  message: tooManyAttempts,
})

// Limita los intentos de usar enlaces (tokens) por IP
export const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyAttempts,
})

// Limita los intentos fallidos de cambiar la contraseña por cuenta
export const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `cambio:${req.session?.idUser ?? ipKeyGenerator(req.ip)}`,
  message: tooManyAttempts,
})

// Limita las confirmaciones de pago por IP
export const confirmLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyAttempts,
})

const tooManyOrders = { error: true, statusCode: 429, statusMessage: 'Hiciste muchos pedidos seguidos. Espera un rato e inténtalo de nuevo.' }

// Limita los pedidos por correo y por hora (evita reservar el inventario en masa); solo cuentan los pedidos que sí se registran
export const orderEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  skipFailedRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `pedido:${emailKey(req) || ipKeyGenerator(req.ip)}`,
  message: tooManyOrders,
})

// Limita los pedidos por IP (generoso, porque detrás del proxy muchos clientes comparten IP); solo cuentan los pedidos que sí se registran
export const orderIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  skipFailedRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyOrders,
})
