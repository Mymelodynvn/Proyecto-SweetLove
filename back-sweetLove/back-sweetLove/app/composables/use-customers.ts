export type CustomerTier = 'VIP' | 'Frecuente' | 'Nuevo'

export interface Customer {
  name: string
  email: string
  phone: string
  city: string
  orderCount: number
  totalSpent: number
  tier: CustomerTier
}

const RECURRING_ORDER_THRESHOLD = 6

const DEFAULT_CUSTOMERS = (): Customer[] => [
  { name: 'Laura Gómez', email: 'laura.gomez@email.com', phone: '300 123 4567', city: 'Medellín', orderCount: 14, totalSpent: 1680000, tier: 'VIP' },
  { name: 'Carlos Restrepo', email: 'carlos.restrepo@email.com', phone: '311 987 6543', city: 'Envigado', orderCount: 8, totalSpent: 720000, tier: 'Frecuente' },
  { name: 'Ana María Torres', email: 'anamaria.t@email.com', phone: '315 456 7890', city: 'Medellín', orderCount: 6, totalSpent: 540000, tier: 'Frecuente' },
  { name: 'Julián Pérez', email: 'julian.perez@email.com', phone: '320 111 2233', city: 'Bello', orderCount: 3, totalSpent: 310000, tier: 'Frecuente' },
  { name: 'Sofía Cardona', email: 'sofia.cardona@email.com', phone: '301 444 5566', city: 'Sabaneta', orderCount: 1, totalSpent: 42000, tier: 'Nuevo' },
  { name: 'Valentina Ruiz', email: 'valen.ruiz@email.com', phone: '312 777 8899', city: 'Medellín', orderCount: 1, totalSpent: 120000, tier: 'Nuevo' },
  { name: 'Andrés Mejía', email: 'andres.mejia@email.com', phone: '304 222 3344', city: 'Itagüí', orderCount: 11, totalSpent: 980000, tier: 'VIP' },
]

export const customerInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')

export const useCustomers = () => {
  const customers = useState<Customer[]>('customers', DEFAULT_CUSTOMERS)

  const vipCustomers = computed(() =>
    customers.value.filter((customer) => customer.tier === 'VIP'),
  )

  const recurringCustomers = computed(() =>
    customers.value.filter((customer) => customer.orderCount >= RECURRING_ORDER_THRESHOLD),
  )

  const topCustomersBySpending = computed(() =>
    [...customers.value].sort((first, second) => second.totalSpent - first.totalSpent),
  )

  return { customers, vipCustomers, recurringCustomers, topCustomersBySpending }
}
