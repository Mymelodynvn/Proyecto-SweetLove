// Mapa completo de la API (/api)
import { Router } from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import { requireAdmin } from '../middleware/auth.js'
import * as auth from '../controllers/authController.js'
import * as products from '../controllers/productController.js'
import * as orders from '../controllers/orderController.js'
import * as panel from '../controllers/panelController.js'
import * as health from '../controllers/healthController.js'
import * as payments from '../controllers/paymentController.js'

const tooManyAttempts = { error: true, statusCode: 429, statusMessage: 'Demasiados intentos. Intenta de nuevo en unos minutos.' }

// Limita los intentos fallidos de login por correo (no por IP: detrás del proxy de Render todos los usuarios comparten la misma IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => String(req.body?.email ?? '').trim().toLowerCase() || ipKeyGenerator(req.ip),
  message: tooManyAttempts,
})

// Limita los registros por IP para frenar el spam de cuentas
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooManyAttempts,
})

const router = Router()

// --- Públicas (tienda) ---
router.get('/health', health.check)
router.get('/products', products.list)
router.post('/orders', orders.create)
router.post('/payments/webhook', payments.webhook)
router.post('/auth/login', loginLimiter, auth.login)
router.post('/auth/register', registerLimiter, auth.register)
router.post('/auth/logout', auth.logout)
router.get('/auth/me', auth.me)

// --- Solo administrador (panel) ---
router.post('/products', requireAdmin, products.create)
router.put('/products/:id', requireAdmin, products.update)
router.delete('/products/:id', requireAdmin, products.remove)
router.get('/orders', requireAdmin, orders.list)
router.patch('/orders/:id', requireAdmin, orders.updateStatus)
router.get('/customers', requireAdmin, panel.customers)
router.get('/payments', requireAdmin, panel.payments)
router.get('/shipments', requireAdmin, panel.shipments)
router.get('/suppliers', requireAdmin, panel.suppliers)
router.get('/dashboard', requireAdmin, panel.dashboard)
router.get('/reports', requireAdmin, panel.reports)

export default router
