// Código de un pedido: viaja en el enlace de regreso de Mercado Pago y prueba que quien confirma un pago recibió ese enlace (no basta adivinar un número de pedido)
import { createHmac, timingSafeEqual } from 'node:crypto'
import { config } from '../config/env.js'

// Calcula el código de un pedido a partir de su número y del secreto del servidor, recibe orderId
export const orderToken = (orderId) => createHmac('sha256', config.sessionSecret).update(`pedido:${orderId}`).digest('hex').slice(0, 32)

// Comprueba que el código recibido corresponda al pedido, recibe orderId, token
export const isValidOrderToken = (orderId, token) => {
  const expected = Buffer.from(orderToken(orderId))
  const received = Buffer.from(String(token ?? ''))
  return received.length === expected.length && timingSafeEqual(received, expected)
}
