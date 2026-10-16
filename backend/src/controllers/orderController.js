// Controlador de pedidos: listado y cambio de estado para el panel, y creación desde la tienda
import { HttpError } from '../utils/httpError.js'
import { parseAddress, parseEmail, parseName, parseOrderItems, parsePhone, parsePositiveInt } from '../utils/validate.js'
import * as orderModel from '../models/orderModel.js'
import * as orderService from '../services/orderService.js'
import * as mercadoPago from '../services/mercadoPagoService.js'

// Estados que un pedido puede tener
const ORDER_STATUSES = ['Pendiente', 'En preparación', 'Enviado', 'Completado', 'Cancelado']

// Estados a los que puede pasar un pedido desde cada estado: solo hacia adelante, y se puede cancelar hasta que se envía
const ALLOWED_TRANSITIONS = {
  Pendiente: ['En preparación', 'Enviado', 'Completado', 'Cancelado'],
  'En preparación': ['Enviado', 'Completado', 'Cancelado'],
  Enviado: ['Completado'],
  Completado: [],
  Cancelado: [],
}

// Traduce el estado guardado en la base al que muestra la interfaz, recibe status
const normalizeOrderStatus = (status) => (status === 'Pagado' ? 'Completado' : status || 'Pendiente')

// Formatea un producto del pedido como "Nombre (xCantidad)", recibe row
const formatItem = (row) => `${row.productName} (x${Number(row.quantity) || 0})`

// GET /api/orders — lista los pedidos (solo administrador), recibe res
export const list = async (_req, res) => {
  const grouped = new Map()

  for (const row of await orderModel.findAllWithItems()) {
    const current = grouped.get(row.orderId)

    if (current) {
      if (row.productName) current.itemNames.push(formatItem(row))
      continue
    }

    grouped.set(row.orderId, {
      id: `#SL${String(row.orderId).padStart(4, '0')}`,
      customer: String(row.customer ?? ''),
      phone: String(row.phone ?? ''),
      address: String(row.address ?? ''),
      amount: Number(row.amount ?? 0),
      date: String(row.date ?? ''),
      status: normalizeOrderStatus(row.dbStatus),
      paymentStatus: String(row.paymentStatus ?? 'Sin pago registrado'),
      itemNames: row.productName ? [formatItem(row)] : [],
    })
  }

  res.json([...grouped.values()].map(({ itemNames, ...order }) => ({ ...order, items: itemNames.join(', ') })))
}

// PATCH /api/orders/:id — cambia el estado de un pedido (solo administrador); el pedido solo avanza y, si se paga con Mercado Pago, no sale de Pendiente sin el pago aprobado, recibe req, res
export const updateStatus = async (req, res) => {
  const id = parsePositiveInt(String(req.params.id).replace('#SL', ''), 'El identificador de pedido')
  const status = req.body?.status

  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Estado de pedido inválido.')

  const order = await orderModel.findPaymentByOrder(id)
  if (!order) throw new HttpError(404, 'El pedido no existe.')
  const current = normalizeOrderStatus(order.estadoPedido)

  // Repetir el estado actual no cambia nada
  if (status === current) return void res.json({ ok: true })
  if (current === 'Cancelado') throw new HttpError(409, 'Un pedido cancelado no se puede reactivar.')
  if (!ALLOWED_TRANSITIONS[current]?.includes(status)) throw new HttpError(409, `No se puede pasar un pedido de «${current}» a «${status}».`)

  const paidWithMercadoPago = order.proveedorPago === mercadoPago.MERCADO_PAGO
  if (current === 'Pendiente' && status !== 'Cancelado' && paidWithMercadoPago && order.estadoPago !== 'Aprobado') {
    throw new HttpError(409, `No se puede pasar a «${status}» porque el pago no está aprobado (estado del pago: ${order.estadoPago}).`)
  }

  // Cancelar devuelve los productos al inventario; un pago ya aprobado no se devuelve solo, así que se avisa para reembolsarlo en Mercado Pago
  if (status === 'Cancelado') {
    await orderModel.cancelAndRestock(id, 'Cancelado')
    return void res.json({ ok: true, ...(order.estadoPago === 'Aprobado' ? { refundPending: true } : {}) })
  }

  await orderModel.updateStatus(id, status)
  res.json({ ok: true })
}

// Medios de pago que acepta la tienda (el único activo es Mercado Pago; si falta, se usa ese)
const PAYMENT_METHODS = [mercadoPago.MERCADO_PAGO]

// Devuelve las líneas del pedido (lista `items`, o un solo productId + quantity por compatibilidad), recibe body
const parseItems = (body) => {
  if (Array.isArray(body.items)) return parseOrderItems(body.items)
  if (body.productId && body.quantity) return parseOrderItems([{ productId: body.productId, quantity: body.quantity }])
  return parseOrderItems([])
}

// POST /api/orders — registra un pedido desde la tienda (público); con Mercado Pago responde también el enlace de pago, recibe req, res
export const create = async (req, res) => {
  const body = req.body ?? {}
  // Todos los datos se validan aquí: el formulario del navegador se puede saltar
  const name = parseName(body.name, 'El nombre')
  const lastName = parseName(body.lastName, 'El apellido', 50, false)
  const email = parseEmail(body.email)
  const phone = parsePhone(body.phone)
  const address = parseAddress(body.address)

  const items = parseItems(body)

  // Una lista cerrada evita pedidos con "medios" inventados, que nunca se cancelarían por falta de pago
  const paymentMethod = String(body.paymentMethod ?? '').trim() || mercadoPago.MERCADO_PAGO
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new HttpError(400, 'Medio de pago no disponible.')

  const { lines, ...order } = await orderService.createOrder({
    customer: { name, lastName, email, phone, address },
    items,
    paymentMethod,
  })

  // Se crea el enlace de pago de Mercado Pago; si falla, el pedido igual queda registrado como Pendiente
  try {
    const { initPoint } = await mercadoPago.createPreference({ orderId: order.idPedido, items: lines })
    res.status(201).json({ ...order, initPoint })
  } catch (error) {
    console.error('[pedido] no se pudo crear el pago en Mercado Pago:', error.message)
    res.status(201).json({
      ...order,
      initPoint: null,
      paymentError: 'No se pudo iniciar el pago con Mercado Pago. Tu pedido quedó registrado.',
    })
  }
}
