// Controlador de pagos: avisos (webhook) de Mercado Pago y confirmación del pago al volver a la tienda
import { HttpError } from '../utils/httpError.js'
import { parsePositiveInt } from '../utils/validate.js'
import { isValidOrderToken } from '../utils/order-token.js'
import * as mercadoPago from '../services/mercadoPagoService.js'
import * as paymentService from '../services/paymentService.js'

// POST /api/payments/webhook — aviso de Mercado Pago: consulta el pago y actualiza el estado del pedido, recibe req, res
export const webhook = async (req, res) => {
  const type = req.query.type ?? req.query.topic ?? req.body?.type ?? req.body?.topic
  const dataId = String(req.query['data.id'] ?? req.query.id ?? req.body?.data?.id ?? '')

  // Solo interesan los avisos de pagos; el resto se ignora respondiendo 200 para que no se repitan
  if (type !== 'payment' || !dataId) return void res.json({ ok: true, ignored: true })

  const validSignature = mercadoPago.verifyWebhookSignature({
    signature: req.get('x-signature'),
    requestId: req.get('x-request-id'),
    dataId,
  })
  if (!validSignature) throw new HttpError(401, 'Firma del aviso no válida.')

  // El estado se pide a Mercado Pago: lo que diga el aviso por sí solo no se usa
  let payment
  try {
    payment = await mercadoPago.getPayment(dataId)
  } catch (error) {
    // Un pago que no existe (por ejemplo, la prueba del panel) no debe provocar reintentos
    if (error.statusCode === 404) return void res.json({ ok: true, ignored: true })
    throw error
  }

  const orderId = Number(payment.external_reference)
  if (Number.isInteger(orderId) && orderId > 0) await paymentService.syncOrderPayment(orderId)

  res.json({ ok: true })
}

// POST /api/payments/confirm — la tienda pide confirmar el pago de un pedido al volver de Mercado Pago; exige el código del enlace de regreso, recibe req, res
export const confirm = async (req, res) => {
  const orderId = parsePositiveInt(req.body?.orderId, 'El pedido')
  // Sin el código no se puede consultar el pago de un pedido ajeno solo con adivinar su número
  if (!isValidOrderToken(orderId, req.body?.token)) throw new HttpError(403, 'El enlace de confirmación no es válido.')
  const { status } = await paymentService.syncOrderPayment(orderId)
  res.json({ ok: true, status })
}
