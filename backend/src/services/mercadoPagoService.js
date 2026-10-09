// Servicio de Mercado Pago (Checkout Pro): crea el enlace de pago, consulta pagos y valida los avisos (webhook)
import { createHmac, timingSafeEqual } from 'node:crypto'
import { config } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

const API_URL = 'https://api.mercadopago.com'
const REQUEST_TIMEOUT_MS = 10000

// Nombre del medio de pago que activa Mercado Pago en el checkout
export const MERCADO_PAGO = 'Mercado Pago'

// Indica si hay un Access Token configurado
export const isConfigured = () => Boolean(config.mercadoPago.accessToken)

// Llama a la API de Mercado Pago con el Access Token y devuelve el JSON, recibe path, options
const request = async (path, options = {}) => {
  if (!isConfigured()) throw new HttpError(503, 'Mercado Pago no está configurado (falta MP_ACCESS_TOKEN).')

  const response = await fetch(API_URL + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.mercadoPago.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // El detalle (data.message) solo se registra en el servidor; nunca se envía al navegador
    console.error('[mercadopago]', response.status, data?.message ?? '')
    throw new HttpError(response.status === 404 ? 404 : 502, `Mercado Pago respondió ${response.status}`)
  }
  return data
}

// Direcciones a las que vuelve el cliente según el resultado del pago, sin parámetros extra
const backUrls = () => {
  const base = `${config.mercadoPago.frontendUrl}/tienda/pagoResultado.html`
  return { success: `${base}?resultado=exito`, failure: `${base}?resultado=fallo`, pending: `${base}?resultado=pendiente` }
}

// Crea el enlace de pago (preferencia) de un pedido y devuelve su dirección, recibe orderId, items
export const createPreference = async ({ orderId, items }) => {
  const { currencyId, frontendUrl, backendPublicUrl } = config.mercadoPago

  const body = {
    items: items.map((item) => ({
      id: String(item.productId),
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: currencyId,
    })),
    // Con esto el aviso de pago sabe a qué pedido corresponde
    external_reference: String(orderId),
    back_urls: backUrls(),
    statement_descriptor: 'SWEET LOVE',
  }
  // Mercado Pago solo acepta la vuelta automática si la tienda está en HTTPS
  if (frontendUrl.startsWith('https://')) body.auto_return = 'approved'
  // Los avisos solo llegan si el backend tiene una URL pública
  if (backendPublicUrl) body.notification_url = `${backendPublicUrl}/api/payments/webhook`

  const data = await request('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify(body),
    // Evita crear dos enlaces si la petición se repite
    headers: { 'X-Idempotency-Key': `pedido-${orderId}` },
  })
  return { preferenceId: data.id, initPoint: data.init_point }
}

// Consulta un pago en Mercado Pago (fuente de verdad del estado), recibe paymentId
export const getPayment = async (paymentId) => {
  if (!/^\d+$/.test(String(paymentId))) throw new HttpError(400, 'Identificador de pago no válido.')
  return request(`/v1/payments/${paymentId}`)
}

// Comprueba la firma (x-signature) de un aviso con la clave secreta; sin clave configurada no se exige, recibe signature, requestId, dataId
export const verifyWebhookSignature = ({ signature, requestId, dataId }) => {
  const secret = config.mercadoPago.webhookSecret
  if (!secret) return true
  if (!signature) return false

  const parts = Object.fromEntries(signature.split(',').map((piece) => piece.trim().split('=')))
  if (!parts.ts || !parts.v1) return false

  // Texto firmado: id, request-id y ts (los que no vengan se omiten)
  let manifest = ''
  if (dataId) manifest += `id:${String(dataId).toLowerCase()};`
  if (requestId) manifest += `request-id:${requestId};`
  manifest += `ts:${parts.ts};`

  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  const received = Buffer.from(parts.v1)
  const wanted = Buffer.from(expected)
  return received.length === wanted.length && timingSafeEqual(received, wanted)
}

// Traduce el estado de Mercado Pago al estado que guarda la tabla pago, recibe status
export const mapPaymentStatus = (status) => {
  if (status === 'approved') return 'Aprobado'
  if (status === 'rejected' || status === 'cancelled') return 'Rechazado'
  if (status === 'refunded' || status === 'charged_back') return 'Reembolsado'
  return 'Pendiente'
}
