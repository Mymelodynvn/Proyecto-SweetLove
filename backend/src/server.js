// Punto de entrada del backend: abre el puerto HTTP y programa la cancelación de pedidos sin pagar
import { createApp } from './app.js'
import { config } from './config/env.js'
import * as mailer from './services/mailer.js'
import * as mercadoPago from './services/mercadoPagoService.js'
import * as paymentService from './services/paymentService.js'

// Cada cuánto se revisan los pedidos con Mercado Pago que no se pagaron (5 minutos)
const EXPIRE_EVERY_MS = 5 * 60 * 1000

// Revisa los pedidos sin pagar y registra el resultado, sin detener el servidor si algo falla
const expireStaleOrders = async () => {
  try {
    const summary = await paymentService.expireStaleOrders()
    if (summary.checked) console.log('[pagos] pedidos revisados:', JSON.stringify(summary))
  } catch (error) {
    console.error('[pagos] no se pudieron revisar los pedidos sin pagar:', error.message)
  }
}

// Avisa en el registro de lo que falta configurar para que todo funcione
const warnAboutConfiguration = () => {
  if (!mailer.isEnabled()) console.warn('[config] SMTP_USER y SMTP_PASSWORD vacíos: no se envían correos (sin recuperar contraseña ni verificar correo).')
  if (!mercadoPago.isConfigured()) console.warn('[config] MP_ACCESS_TOKEN vacío: los pagos con Mercado Pago no funcionan.')
  if (config.isProduction && !config.mercadoPago.webhookSecret) {
    console.warn('[config] MP_WEBHOOK_SECRET vacía: los avisos de Mercado Pago se rechazan (el pago se confirma al volver a la tienda).')
  }
}

createApp().listen(config.port, () => {
  console.log(`Sweet Love API escuchando en http://localhost:${config.port}`)
  warnAboutConfiguration()

  // Una revisión al arrancar y luego cada 5 minutos; unref permite que el proceso termine si no hay nada más
  setTimeout(expireStaleOrders, 15 * 1000).unref()
  setInterval(expireStaleOrders, EXPIRE_EVERY_MS).unref()
})
