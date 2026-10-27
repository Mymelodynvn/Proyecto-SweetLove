// Mapa completo de la API (/api)
import { Router } from 'express'
import { requireAdmin, requireUser } from '../middleware/auth.js'
import {
  changePasswordLimiter, confirmLimiter, loginLimiter, mailLimiter, orderEmailLimiter, orderIpLimiter, registerLimiter, tokenLimiter,
} from '../middleware/rateLimits.js'
import * as auth from '../controllers/authController.js'
import * as products from '../controllers/productController.js'
import * as orders from '../controllers/orderController.js'
import * as panel from '../controllers/panelController.js'
import * as health from '../controllers/healthController.js'
import * as payments from '../controllers/paymentController.js'
import * as suppliers from '../controllers/supplierController.js'

const router = Router()

// --- Públicas (tienda) ---
router.get('/health', health.check)
router.get('/products', products.list)
router.post('/orders', orderIpLimiter, orderEmailLimiter, orders.create)
router.post('/payments/webhook', payments.webhook)
router.post('/payments/confirm', confirmLimiter, payments.confirm)
router.post('/auth/login', loginLimiter, auth.login)
router.post('/auth/register', registerLimiter, auth.register)
router.post('/auth/logout', auth.logout)
router.get('/auth/me', auth.me)
router.post('/auth/forgot-password', mailLimiter, auth.forgotPassword)
router.post('/auth/reset-password', tokenLimiter, auth.resetPassword)
router.post('/auth/verify-email', tokenLimiter, auth.verifyEmail)
router.post('/auth/resend-verification', mailLimiter, auth.resendVerification)
router.post('/auth/change-password', requireUser, changePasswordLimiter, auth.changePassword)

// --- Solo administrador (panel) ---
router.post('/products', requireAdmin, products.create)
router.put('/products/:id', requireAdmin, products.update)
router.delete('/products/:id', requireAdmin, products.remove)
router.get('/orders', requireAdmin, orders.list)
router.patch('/orders/:id', requireAdmin, orders.updateStatus)
router.get('/customers', requireAdmin, panel.customers)
router.get('/payments', requireAdmin, panel.payments)
router.get('/shipments', requireAdmin, panel.shipments)
router.get('/suppliers', requireAdmin, suppliers.list)
router.post('/suppliers', requireAdmin, suppliers.create)
router.put('/suppliers/:id', requireAdmin, suppliers.update)
router.delete('/suppliers/:id', requireAdmin, suppliers.remove)
router.get('/dashboard', requireAdmin, panel.dashboard)
router.get('/reports', requireAdmin, panel.reports)

export default router
