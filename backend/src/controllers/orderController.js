// Controlador de pedidos: listado y cambio de estado para el panel, y creación desde la tienda
import { HttpError } from '../utils/httpError.js'
import { cleanText, parseEmail, parsePositiveInt } from '../utils/validate.js'
import * as orderModel from '../models/orderModel.js'
import * as orderService from '../services/orderService.js'

// Estados que un pedido puede tener
const ORDER_STATUSES = ['Pendiente', 'En preparación', 'Enviado', 'Completado', 'Cancelado']

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

// PATCH /api/orders/:id — cambia el estado de un pedido (solo administrador), recibe req, res
export const updateStatus = async (req, res) => {
  const id = parsePositiveInt(String(req.params.id).replace('#SL', ''), 'El identificador de pedido')
  const status = req.body?.status

  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Estado de pedido inválido.')
  if (!(await orderModel.updateStatus(id, status))) throw new HttpError(404, 'El pedido no existe.')

  res.json({ ok: true })
}

// Devuelve las líneas del pedido (lista `items`, o un solo productId + quantity por compatibilidad), recibe body
const parseItems = (body) => {
  if (Array.isArray(body.items) && body.items.length) return body.items
  if (body.productId && body.quantity) return [{ productId: body.productId, quantity: body.quantity }]
  return []
}

// POST /api/orders — registra un pedido desde la tienda (público), recibe req, res
export const create = async (req, res) => {
  const body = req.body ?? {}
  const name = cleanText(body.name)
  if (!name) throw new HttpError(400, 'Nombre y correo son obligatorios.')

  const items = parseItems(body)
  if (!items.length) throw new HttpError(400, 'El pedido debe contener al menos un producto.')

  const result = await orderService.createOrder({
    customer: {
      name,
      lastName: cleanText(body.lastName),
      email: parseEmail(body.email),
      phone: cleanText(body.phone),
      address: cleanText(body.address),
    },
    items,
    paymentMethod: cleanText(body.paymentMethod) || 'Pendiente',
  })

  res.status(201).json(result)
}
