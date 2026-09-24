/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Carga los clientes reales desde la API y calcula indicadores para el panel.
 */
export type CustomerTier = 'VIP' | 'Frecuente' | 'Nuevo'
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
export const customerInitials = (name: string) => name.split(' ').slice(0, 2).map((part) => part.charAt(0)).join('')
export const useCustomers = () => {
  const customers = useState<Customer[]>('customers-db', () => [])
  const loaded = useState('customers-db-loaded', () => false)
  const load = async () => {
    if (loaded.value) return
    try { customers.value = await $fetch<Customer[]>('/api/customers') }
    catch (error) { console.warn('No se pudieron cargar clientes desde MySQL.', error) }
    finally { loaded.value = true }
  }
  const vipCustomers = computed(() => customers.value.filter((customer) => customer.tier === 'VIP'))
  const recurringCustomers = computed(() => customers.value.filter((customer) => customer.orderCount >= 6))
  const topCustomersBySpending = computed(() => [...customers.value].sort((a, b) => b.totalSpent - a.totalSpent))
  return { customers, vipCustomers, recurringCustomers, topCustomersBySpending, loadFromStorage: load }
}
