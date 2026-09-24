/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Obtiene los pedidos registrados en MySQL.
 *
 * El modelo normalizado permite que un pedido tenga varios productos:
 * pedido 1 ───< itempedido >─── producto
 *          └── usuario
 */
import { getDatabase } from '../utils/db'

/**
 * Convierte el estado almacenado en la base al estado que utiliza la interfaz.
 * El estado del pedido es independiente del estado del pago.
 */
const normalizeOrderStatus = (status: string | null): Order['status'] => {
  if (status === 'Pagado') return 'Completado'
  return (status || 'Pendiente') as Order['status']
}

type Order = {
  id: string
  customer: string
  phone: string
  address: string
  items: string
  amount: number
  date: string
  status: 'Pendiente' | 'En preparación' | 'Enviado' | 'Completado' | 'Cancelado'
  paymentStatus: string
}

export default defineEventHandler(async () => {
  const database = getDatabase()
  const [rows] = await database.query(`
    SELECT
      p.idPedido AS orderId,
      CONCAT(u.nombre, ' ', u.apellido) AS customer,
      u.celular AS phone,
      u.direccion AS address,
      pr.nombre AS productName,
      i.cantidad AS quantity,
      i.subTotal AS itemSubtotal,
      p.precioTotal AS amount,
      DATE_FORMAT(p.fecha, '%Y-%m-%d') AS date,
      p.estadoPedido AS dbStatus,
      COALESCE(pay.estadoPago, 'Sin pago registrado') AS paymentStatus
    FROM pedido p
    INNER JOIN usuario u ON u.idUser = p.idUser
    LEFT JOIN itempedido i ON i.idPedido = p.idPedido
    LEFT JOIN producto pr ON pr.idProducto = i.idProducto
    LEFT JOIN pago pay ON pay.idPedido = p.idPedido
    ORDER BY p.idPedido DESC, i.idItem ASC
  `)

  const grouped = new Map<number, Omit<Order, 'items'> & { itemNames: string[] }>()

  for (const row of rows as Array<Record<string, unknown>>) {
    const orderId = Number(row.orderId)
    const current = grouped.get(orderId)

    if (current) {
      if (row.productName) {
        current.itemNames.push(`${String(row.productName)} (x${Number(row.quantity) || 0})`)
      }
      continue
    }

    grouped.set(orderId, {
      id: `#SL${String(orderId).padStart(4, '0')}`,
      customer: String(row.customer ?? ''),
      phone: String(row.phone ?? ''),
      address: String(row.address ?? ''),
      amount: Number(row.amount ?? 0),
      date: String(row.date ?? ''),
      status: normalizeOrderStatus(row.dbStatus as string | null),
      paymentStatus: String(row.paymentStatus ?? 'Sin pago registrado'),
      itemNames: row.productName
        ? [`${String(row.productName)} (x${Number(row.quantity) || 0})`]
        : [],
    })
  }

  return Array.from(grouped.values()).map(({ itemNames, ...order }) => ({
    ...order,
    items: itemNames.join(', '),
  }))
})
