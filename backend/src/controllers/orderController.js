/**
 * Controlador de pedidos: listado y cambio de estado para el panel, y creación desde la tienda.
 */
import { HttpError } from '../utils/httpError.js'
import { cleanText, parseEmail, parsePositiveInt } from '../utils/validate.js'
import * as orderModel from '../models/orderModel.js'
import * as orderService from '../services/orderService.js'

/** Estados que un pedido puede tener. */
const ORDER_STATUSES = ['Pendiente', 'En preparación', 'Enviado', 'Completado', 'Cancelado']

/**
 * Traduce el estado guardado en la base al que muestra la interfaz.
 * Datos antiguos usaban "Pagado"; hoy equivale a "Completado".
 * @param {string|null} status Estado en la base de datos.
 * @returns {string} Estado para la interfaz.
 */
const normalizeOrderStatus = (status) => (status === 'Pagado' ? 'Completado' : status || 'Pendiente')

/**
 * Formatea un producto del pedido como "Nombre (xCantidad)".
 * @param {{productName:string, quantity:number}} row Fila con producto y cantidad.
 * @returns {string} Texto de la línea.
 */
const formatItem = (row) => `${row.productName} (x${Number(row.quantity) || 0})`

/**
 * GET /api/orders — lista los pedidos (solo administrador).
 * La consulta devuelve una fila por producto; aquí se agrupan en un pedido con sus productos.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta con la lista de pedidos.
 * @returns {Promise<void>}
 */
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

/**
 * PATCH /api/orders/:id — cambia el estado de un pedido (solo administrador).
 * Acepta el identificador numérico o el formato "#SL0007".
 * Body: { status }.
 * @param {import('express').Request} req Petición con :id y el nuevo estado.
 * @param {import('express').Response} res Respuesta `{ ok: true }`.
 * @returns {Promise<void>}
 */
export const updateStatus = async (req, res) => {
  const id = parsePositiveInt(String(req.params.id).replace('#SL', ''), 'El identificador de pedido')
  const status = req.body?.status

  if (!ORDER_STATUSES.includes(status)) throw new HttpError(400, 'Estado de pedido inválido.')
  if (!(await orderModel.updateStatus(id, status))) throw new HttpError(404, 'El pedido no existe.')

  res.json({ ok: true })
}

/**
 * Normaliza el cuerpo de un pedido: acepta una lista `items` o, por compatibilidad
 * con versiones anteriores, un único `productId` + `quantity`.
 * @param {object} body Cuerpo de la petición.
 * @returns {Array<{productId:number, quantity:number}>} Líneas del pedido.
 */
const parseItems = (body) => {
  if (Array.isArray(body.items) && body.items.length) return body.items
  if (body.productId && body.quantity) return [{ productId: body.productId, quantity: body.quantity }]
  return []
}

/**
 * POST /api/orders — registra un pedido desde la tienda (público).
 * Body: { name, lastName?, email, phone?, address?, items: [{productId, quantity}], paymentMethod? }.
 * @param {import('express').Request} req Petición con los datos del comprador y el carrito.
 * @param {import('express').Response} res Respuesta 201 con el resumen del pedido.
 * @returns {Promise<void>}
 */
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
