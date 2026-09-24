/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Gestiona los pedidos reales almacenados en MySQL.
 */
export type OrderStatus = 'Pendiente' | 'En preparación' | 'Enviado' | 'Completado' | 'Cancelado'
export const ORDER_STATUSES: OrderStatus[] = ['Pendiente', 'En preparación', 'Enviado', 'Completado', 'Cancelado']
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
export const useOrders = () => {
  const orders = useState<Order[]>('orders-db', () => [])
  const loaded = useState('orders-db-loaded', () => false)
  const load = async () => {
    if (loaded.value) return
    try { orders.value = await $fetch<Order[]>('/api/orders') }
    catch (error) { console.warn('No se pudieron cargar pedidos desde MySQL.', error) }
    finally { loaded.value = true }
  }
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try { await $fetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: { status } }) }
    catch (error) { console.warn('No se pudo actualizar el pedido en MySQL.', error); return }
    const target = orders.value.find((order) => order.id === orderId)
    if (target) target.status = status
  }
  return { orders, loadFromStorage: load, updateOrderStatus }
}
