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
}

const DEFAULT_ORDERS = (): Order[] => [
  { id: '#SL0132', customer: 'Laura Gómez', phone: '300 123 4567', address: 'Cra 43A #18-20, Medellín', items: 'Torta personalizada de cumpleaños', amount: 185000, date: '17 ago 2026', status: 'Pendiente' },
  { id: '#SL0131', customer: 'Carlos Restrepo', phone: '311 987 6543', address: 'Cl 37 Sur #42-10, Envigado', items: 'Cupcakes de fresa (x12)', amount: 68000, date: '17 ago 2026', status: 'En preparación' },
  { id: '#SL0130', customer: 'Ana María Torres', phone: '315 456 7890', address: 'Cra 70 #45-30, Medellín', items: 'Cheesecake de maracuyá', amount: 95000, date: '16 ago 2026', status: 'Enviado' },
  { id: '#SL0129', customer: 'Julián Pérez', phone: '320 111 2233', address: 'Cl 50 #46-15, Bello', items: 'Torta red velvet + galletas (x6)', amount: 159000, date: '15 ago 2026', status: 'Completado' },
  { id: '#SL0128', customer: 'Sofía Cardona', phone: '301 444 5566', address: 'Cl 77 Sur #34-120, Sabaneta', items: 'Brownies artesanales (x9)', amount: 42000, date: '15 ago 2026', status: 'Completado' },
  { id: '#SL0127', customer: 'Valentina Ruiz', phone: '312 777 8899', address: 'Cra 80 #32-45, Medellín', items: 'Torta de chocolate', amount: 120000, date: '14 ago 2026', status: 'Cancelado' },
  { id: '#SL0126', customer: 'Andrés Mejía', phone: '304 222 3344', address: 'Cl 36 #52-70, Itagüí', items: 'Postre de tres leches (x4)', amount: 72000, date: '13 ago 2026', status: 'Completado' },
  { id: '#SL0125', customer: 'Camila Ochoa', phone: '316 555 0011', address: 'Cra 25 #10-80, Medellín', items: 'Cupcakes de vainilla (x6)', amount: 32000, date: '12 ago 2026', status: 'Completado' },
]

export const useOrders = () => {
  const { state: orders, loadFromStorage, persist } = usePersistentState<Order[]>(
    'orders',
    'sweet-love-admin-orders',
    DEFAULT_ORDERS,
  )

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const target = orders.value.find((order) => order.id === orderId)
    if (!target) return
    target.status = status
    persist()
  }

  return { orders, loadFromStorage, updateOrderStatus }
}
