// Servicio de pagos: concilia el estado de los pedidos con Mercado Pago y cancela los pedidos que no se pagaron
import { config } from '../config/env.js'
import * as orderModel from '../models/orderModel.js'
import * as mercadoPago from './mercadoPagoService.js'

// Estados de pago que ya no cambian al consultar Mercado Pago
const FINAL_PAYMENT_STATES = ['Aprobado', 'Reembolsado', 'Cancelado', 'Expirado']

// Elige el pago que manda: el aprobado si lo hay; si no, el más reciente (la lista llega del más nuevo al más viejo), recibe payments
const pickPayment = (payments) => payments.find((payment) => payment.status === 'approved') ?? payments[0]

// Consulta Mercado Pago y actualiza el pago de un pedido; devuelve el estado resultante, recibe orderId
export const syncOrderPayment = async (orderId) => {
  const current = await orderModel.findPaymentByOrder(orderId)
  if (!current?.idPago || current.proveedorPago !== mercadoPago.MERCADO_PAGO) return { status: current?.estadoPago ?? null }
  if (FINAL_PAYMENT_STATES.includes(current.estadoPago)) return { status: current.estadoPago }

  const payment = pickPayment(await mercadoPago.findPaymentsByReference(orderId))
  if (!payment) return { status: current.estadoPago }

  const status = mercadoPago.mapPaymentStatus(payment.status)

  // Un pago aprobado solo vale si el monto y la moneda coinciden con los del pedido
  if (status === 'Aprobado') {
    const sameAmount = Number(payment.transaction_amount) === Number(current.monto)
    const sameCurrency = payment.currency_id === config.mercadoPago.currencyId
    if (!sameAmount || !sameCurrency) {
      console.error(`[pagos] el pago ${payment.id} no coincide con el pedido ${orderId}: ${payment.transaction_amount} ${payment.currency_id} frente a ${current.monto}`)
      return { status: current.estadoPago, mismatch: true }
    }
    // El pedido ya se había cancelado (por ejemplo, por vencer): el dinero entró y hay que reembolsarlo o reactivarlo a mano
    if (current.estadoPedido === 'Cancelado') console.error(`[pagos] REVISAR: el pedido ${orderId} está cancelado pero tiene un pago aprobado (${payment.id})`)
  }

  await orderModel.updatePaymentStatus(orderId, status)
  return { status }
}

// Cancela los pedidos con Mercado Pago que siguen sin pagarse pasado su plazo, y devuelve el stock; antes confirma con Mercado Pago, sin recibir nada
export const expireStaleOrders = async () => {
  const summary = { checked: 0, approved: 0, cancelled: 0, skipped: 0 }
  // Pasados los minutos de vigencia del enlace más un margen, ya no se puede pagar
  const ids = await orderModel.findUnpaidMercadoPagoOrders(config.orderTtlMinutes + 2)

  for (const orderId of ids) {
    summary.checked += 1
    try {
      const { status } = await syncOrderPayment(orderId)
      if (status === 'Aprobado') summary.approved += 1
      // Con el pago en proceso se espera su resultado; los demás estados sin pagar se cancelan
      else if (status === 'Pendiente' || status === 'Rechazado') {
        if (await orderModel.cancelAndRestock(orderId, 'Expirado')) summary.cancelled += 1
      } else summary.skipped += 1
    } catch (error) {
      // Si no se puede confirmar con Mercado Pago no se cancela: podría estar pagado
      console.error(`[pagos] no se pudo revisar el pedido ${orderId}:`, error.message)
      summary.skipped += 1
    }
  }
  return summary
}
