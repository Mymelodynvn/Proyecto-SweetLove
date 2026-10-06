// use-customers.ts — clientes del panel
export type CustomerTier = 'VIP' | 'Frecuente' | 'Nuevo'
// Cliente con sus métricas de compra
export interface Customer {
  id?: number
  name: string
  email: string
  phone: string
  city: string
  orderCount: number
  totalSpent: number
  tier: CustomerTier
}
// Iniciales de un nombre (máximo dos letras) para el avatar, recibe name
export const customerInitials = (name: string) => name.split(' ').slice(0, 2).map((part) => part.charAt(0)).join('')
// Composable de clientes: estado compartido y listas derivadas
export const useCustomers = () => {
  const customers = useState<Customer[]>('customers-db', () => [])
  // Indica si los clientes ya se pidieron al servidor (evita repetir la carga)
  const loaded = useState('customers-db-loaded', () => false)
  // Carga los clientes una sola vez desde la API; si falla, deja la lista vacía y avisa en consola
  const load = async () => {
    if (loaded.value) return
    try { customers.value = await $fetch<Customer[]>('/api/customers') }
    catch (error) { console.warn('No se pudieron cargar clientes desde MySQL.', error) }
    finally { loaded.value = true }
  }
  // Clientes de nivel VIP
  const vipCustomers = computed(() => customers.value.filter((customer) => customer.tier === 'VIP'))
  // Clientes con 6 o más pedidos
  const recurringCustomers = computed(() => customers.value.filter((customer) => customer.orderCount >= 6))
  // Clientes ordenados de mayor a menor gasto total
  const topCustomersBySpending = computed(() => [...customers.value].sort((a, b) => b.totalSpent - a.totalSpent))
  return { customers, vipCustomers, recurringCustomers, topCustomersBySpending, loadFromStorage: load }
}
