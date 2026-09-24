<script setup lang="ts">
import { IconCrown, IconRepeat, IconStarFilled, IconUserPlus } from '@tabler/icons-vue'
import type { CustomerTier } from '~/composables/use-customers'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

useHead({ title: 'Destacados | Sweet Love Admin' })

const { customers, vipCustomers, recurringCustomers, topCustomersBySpending } = useCustomers()
const { products, loadFromStorage: loadProducts } = useProducts()

onMounted(loadProducts)

const newCustomers = computed(() =>
  customers.value.filter((customer) => customer.tier === 'Nuevo'),
)

const tierBadgeClass: Record<CustomerTier, string> = {
  VIP: 'bg-chart-5/40 text-foreground border-transparent',
  Frecuente: 'bg-primary/15 text-primary border-transparent',
  Nuevo: 'bg-secondary text-secondary-foreground border-transparent',
}

const RANK_MEDALS = ['🥇', '🥈', '🥉']

// Historical sales per product name (until real order analytics exist).
const PRODUCT_SALES: Record<string, number> = {
  'Torta de chocolate': 454,
  'Cupcakes de fresa (x6)': 388,
  'Torta red velvet': 246,
  'Cheesecake de maracuyá': 124,
  'Galletas decoradas (x12)': 98,
  'Brownies artesanales (x9)': 76,
  'Postre de tres leches': 64,
  'Cheesecake de frutos rojos': 58,
  'Torta personalizada de cumpleaños': 52,
  'Cupcakes de vainilla (x6)': 41,
}

const productSalesCount = (productName: string) => PRODUCT_SALES[productName] ?? 0

const bestSellingProducts = computed(() =>
  [...products.value].sort(
    (first, second) => productSalesCount(second.name) - productSalesCount(first.name),
  ),
)

const bestRatedProducts = computed(() =>
  [...products.value]
    .filter((product) => product.rating !== '—')
    .sort((first, second) => Number(second.rating) - Number(first.rating))
    .slice(0, 3),
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading text-2xl font-bold">Destacados</h1>
      <p class="text-muted-foreground">
        Los clientes y productos que más quieren a Sweet Love.
      </p>
    </div>

    <Tabs default-value="customers">
      <TabsList>
        <TabsTrigger value="customers">Clientes</TabsTrigger>
        <TabsTrigger value="products">Productos</TabsTrigger>
      </TabsList>

      <TabsContent value="customers" class="flex flex-col gap-6">
        <div class="grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent class="flex items-center gap-3">
              <span class="bg-chart-5/25 text-chart-5 flex size-11 items-center justify-center rounded-full">
                <IconCrown class="size-5" />
              </span>
              <div>
                <p class="text-2xl font-bold">{{ vipCustomers.length }}</p>
                <p class="text-muted-foreground text-sm">Clientes VIP</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="flex items-center gap-3">
              <span class="bg-primary/15 text-primary flex size-11 items-center justify-center rounded-full">
                <IconRepeat class="size-5" />
              </span>
              <div>
                <p class="text-2xl font-bold">{{ recurringCustomers.length }}</p>
                <p class="text-muted-foreground text-sm">Clientes recurrentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="flex items-center gap-3">
              <span class="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
                <IconUserPlus class="size-5" />
              </span>
              <div>
                <p class="text-2xl font-bold">{{ newCustomers.length }}</p>
                <p class="text-muted-foreground text-sm">Clientes nuevos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ranking por compras</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-16">Puesto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Total gastado</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(customer, rankIndex) in topCustomersBySpending" :key="customer.email">
                  <TableCell class="text-lg">
                    {{ RANK_MEDALS[rankIndex] ?? `#${rankIndex + 1}` }}
                  </TableCell>
                  <TableCell>
                    <span class="flex items-center gap-3">
                      <Avatar class="size-9">
                        <AvatarFallback class="bg-secondary text-secondary-foreground text-xs font-semibold">
                          {{ customerInitials(customer.name) }}
                        </AvatarFallback>
                      </Avatar>
                      <span class="flex flex-col">
                        <span class="font-medium">{{ customer.name }}</span>
                        <span class="text-muted-foreground text-xs">{{ customer.email }}</span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>{{ customer.city }}</TableCell>
                  <TableCell>{{ customer.orderCount }}</TableCell>
                  <TableCell class="font-medium">{{ formatCop(customer.totalSpent) }}</TableCell>
                  <TableCell>
                    <Badge :class="tierBadgeClass[customer.tier]">{{ customer.tier }}</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="products" class="flex flex-col gap-6">
        <div class="grid gap-6 sm:grid-cols-3">
          <Card v-for="(product, podiumIndex) in bestRatedProducts" :key="product.id">
            <CardContent class="flex items-center gap-3">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="size-12 shrink-0 rounded-lg object-cover"
              >
              <span v-else class="bg-secondary flex size-12 shrink-0 items-center justify-center rounded-lg text-2xl">
                {{ product.emoji }}
              </span>
              <div class="min-w-0">
                <p class="truncate font-medium">{{ RANK_MEDALS[podiumIndex] }} {{ product.name }}</p>
                <p class="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <IconStarFilled class="text-chart-5 size-4" />
                  {{ product.rating }} · {{ productSalesCount(product.name) }} ventas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-16">Puesto</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ventas</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Calificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(product, rankIndex) in bestSellingProducts" :key="product.id">
                  <TableCell class="text-lg">
                    {{ RANK_MEDALS[rankIndex] ?? `#${rankIndex + 1}` }}
                  </TableCell>
                  <TableCell class="font-medium">
                    <span class="flex items-center gap-2">
                      <img
                        v-if="product.image"
                        :src="product.image"
                        :alt="product.name"
                        class="size-9 shrink-0 rounded-lg object-cover"
                      >
                      <span v-else class="bg-secondary flex size-9 shrink-0 items-center justify-center rounded-lg text-lg">
                        {{ product.emoji }}
                      </span>
                      {{ product.name }}
                    </span>
                  </TableCell>
                  <TableCell>{{ product.category }}</TableCell>
                  <TableCell>{{ productSalesCount(product.name) }}</TableCell>
                  <TableCell>{{ formatCop(product.price) }}</TableCell>
                  <TableCell>
                    <span class="flex items-center gap-1.5">
                      <IconStarFilled class="text-chart-5 size-4" />
                      {{ product.rating }}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
