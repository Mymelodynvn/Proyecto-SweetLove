// use-orders.ts — pedidos del panel
export type OrderStatus = 'Pendiente' | 'En preparación' | 'Enviado' | 'Completado' | 'Cancelado'
// Lista de estados, en el orden en que se ofrecen en la interfaz
export const ORDER_STATUSES: OrderStatus[] = ['Pendiente', 'En preparación', 'Enviado', 'Completado', 'Cancelado']
// Pedido tal como lo entrega la API (con los productos ya resumidos en texto)
export interface Order {
  id: string
  customer: string
  phone: string
  address: string
  items: string
  amount: number
  date: string
  status: OrderStatus
  paymentStatus?: string
}
// Composable de pedidos: estado compartido y operaciones
export const useOrders = () => {
  const orders = useState<Order[]>('orders-db', () => [])
  // Indica si los pedidos ya se pidieron al servidor (evita repetir la carga)
  const loaded = useState('orders-db-loaded', () => false)
  // Carga los pedidos una sola vez desde la API; si falla, deja la lista vacía y avisa en consola
  const load = async () => {
    if (loaded.value) return
    try { orders.value = await $fetch<Order[]>('/api/orders') }
    catch (error) { console.warn('No se pudieron cargar pedidos desde MySQL.', error) }
    finally { loaded.value = true }
  }
  // Cambia el estado de un pedido en el servidor y, si resulta bien, también en pantalla, recibe orderId, status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // Se envía el número sin "#SL": el proxy de Nuxt decodifica "%23" a "#", que cortaría la URL.
    const numericId = Number(orderId.replace(/^#SL/, ''))
    try { await $fetch(`/api/orders/${numericId}`, { method: 'PATCH', body: { status } }) }
    catch (error) { console.warn('No se pudo actualizar el pedido en MySQL.', error); return }
    const target = orders.value.find((order) => order.id === orderId)
    if (target) target.status = status
  }
  return { orders, loadFromStorage: load, updateOrderStatus }
}
