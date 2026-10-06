/**
 * Mapa completo de la API (/api). Cada ruta indica quién puede usarla:
 *  - pública: la tienda (catálogo, checkout, login, registro);
 *  - administrador: todo lo que muestra o modifica el panel.
 * Mantener las reglas de acceso aquí, y no en una lista aparte, evita dejar
 * una ruta nueva abierta por olvido: lo que no declara `requireAdmin` se nota.
 */
import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requireAdmin } from '../middleware/auth.js'
import * as auth from '../controllers/authController.js'
import * as products from '../controllers/productController.js'
import * as orders from '../controllers/orderController.js'
import * as panel from '../controllers/panelController.js'
import * as health from '../controllers/healthController.js'

/** Limita los intentos de login/registro por IP para frenar adivinación de contraseñas. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: true, statusCode: 429, statusMessage: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
})

const router = Router()

// --- Públicas (tienda) ---
router.get('/health', health.check)
router.get('/products', products.list)
router.post('/orders', orders.create)
router.post('/auth/login', authLimiter, auth.login)
router.post('/auth/register', authLimiter, auth.register)
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
