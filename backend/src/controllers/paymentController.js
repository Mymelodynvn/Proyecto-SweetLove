// Controlador de pagos: recibe los avisos (webhook) de Mercado Pago
import { HttpError } from '../utils/httpError.js'
import * as orderModel from '../models/orderModel.js'
import * as mercadoPago from '../services/mercadoPagoService.js'

// POST /api/payments/webhook — aviso de Mercado Pago: consulta el pago y actualiza su estado en la tabla pago, recibe req, res
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
  if (Number.isInteger(orderId) && orderId > 0) {
    await orderModel.updatePaymentStatus(orderId, mercadoPago.mapPaymentStatus(payment.status))
  }

  res.json({ ok: true })
}
