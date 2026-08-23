<script setup lang="ts">
import {
  IconCoin,
  IconShoppingCart,
  IconStarFilled,
  IconTrendingDown,
  IconTrendingUp,
  IconUserCircle,
} from '@tabler/icons-vue'
import type { Component } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { BRAND_COLORS } from '~/lib/constants'

interface StatCard {
  label: string
  value: string
  change: string
  isPositive: boolean
  icon: Component
  iconClass: string
}

interface OrderRow {
  id: string
  amount: string
  shipping: string
  date: string
  status: 'Enviado' | 'Pendiente' | 'Cancelado' | 'Completado'
}

interface ProductRow {
  name: string
  sales: number
  revenue: string
  rating: string
  stock: 'En stock' | 'Poco stock' | 'Agotado'
}

const ideas = [
  {
    title: 'Publica una nueva torta en el blog',
    description: 'Comparte tu última creación con fotos del paso a paso para atraer más clientes.',
  },
  {
    title: 'Promoción de temporada',
    description: 'Crea un combo de cupcakes para las fechas especiales de este mes.',
  },
  {
    title: 'Responde las reseñas',
    description: 'Tienes reseñas nuevas de clientes esperando una respuesta.',
  },
]

const stats: StatCard[] = [
  {
    label: 'Pedidos',
    value: '312',
    change: '2.29%',
    isPositive: true,
    icon: IconShoppingCart,
    iconClass: 'bg-secondary text-secondary-foreground',
  },
  {
    label: 'Ingresos',
    value: '$12.450.000',
    change: '2.19%',
    isPositive: true,
    icon: IconCoin,
    iconClass: 'bg-primary/15 text-primary',
  },
  {
    label: 'Tasa de conversión',
    value: '3.5%',
    change: '3.19%',
    isPositive: false,
    icon: IconUserCircle,
    iconClass: 'bg-chart-5/40 text-foreground',
  },
]

const { chartTheme } = useChartTheme()

const revenueChartBase = computed(() => ({
  chart: { type: 'area', height: 300, toolbar: { show: false }, fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 },
  },
  xaxis: {
    categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  grid: { borderColor: chartTheme.value.gridColor, strokeDashArray: 4 },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))

const incomeChartOptions = computed(() => ({ ...revenueChartBase.value, colors: [BRAND_COLORS.green] }))
const incomeChartSeries = [
  { name: 'Ingresos', data: [420, 380, 510, 460, 620, 890, 760] },
]

const expensesChartOptions = computed(() => ({ ...revenueChartBase.value, colors: [BRAND_COLORS.rose] }))
const expensesChartSeries = [
  { name: 'Gastos', data: [210, 190, 260, 230, 310, 420, 380] },
]

const productSales = [
  { name: 'Tortas personalizadas', amount: '$5.220.000', percent: '38.1%', color: BRAND_COLORS.green },
  { name: 'Cupcakes', amount: '$3.410.000', percent: '28.6%', color: BRAND_COLORS.rose },
  { name: 'Cheesecakes', amount: '$2.180.000', percent: '23.8%', color: BRAND_COLORS.pinkDeep },
  { name: 'Galletas decoradas', amount: '$1.640.000', percent: '9.5%', color: BRAND_COLORS.greenDark },
]

const donutChartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  labels: productSales.map((product) => product.name),
  colors: productSales.map((product) => product.color),
  legend: { show: false },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  plotOptions: { pie: { donut: { size: '78%' } } },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))
const donutChartSeries = [38.1, 28.6, 23.8, 9.5]

const orders: OrderRow[] = [
  { id: '#SL005', amount: '$150.000', shipping: 'Estándar', date: '20 ene 2026', status: 'Enviado' },
  { id: '#SL004', amount: '$200.000', shipping: 'Exprés', date: '22 ene 2026', status: 'Pendiente' },
  { id: '#SL003', amount: '$300.000', shipping: 'Mismo día', date: '18 ene 2026', status: 'Cancelado' },
  { id: '#SL002', amount: '$560.000', shipping: 'Mismo día', date: '13 ene 2026', status: 'Completado' },
  { id: '#SL001', amount: '$560.000', shipping: 'Mismo día', date: '11 ene 2026', status: 'Completado' },
]

const orderStatusClass: Record<OrderRow['status'], string> = {
  Enviado: 'bg-primary/15 text-primary border-transparent',
  Pendiente: 'bg-chart-5/40 text-foreground border-transparent',
  Cancelado: 'bg-destructive/10 text-destructive border-transparent',
  Completado: 'bg-secondary text-secondary-foreground border-transparent',
}

const salesByCity = [
  { city: 'Medellín', amount: '$6.120.000', percent: 45 },
  { city: 'Envigado', amount: '$2.756.000', percent: 25 },
  { city: 'Bello', amount: '$1.864.000', percent: 38 },
  { city: 'Sabaneta', amount: '$1.124.000', percent: 18 },
]

const topProducts: ProductRow[] = [
  { name: 'Torta de chocolate', sales: 454, revenue: '$2.500.000', rating: '5/5', stock: 'En stock' },
  { name: 'Cupcakes de fresa', sales: 388, revenue: '$1.900.000', rating: '5/5', stock: 'En stock' },
  { name: 'Cheesecake de maracuyá', sales: 124, revenue: '$1.300.000', rating: '4.5/5', stock: 'Poco stock' },
  { name: 'Galletas decoradas', sales: 98, revenue: '$860.000', rating: '4.8/5', stock: 'Poco stock' },
  { name: 'Brownies artesanales', sales: 76, revenue: '$540.000', rating: '4.7/5', stock: 'Agotado' },
]

const stockBadgeClass: Record<ProductRow['stock'], string> = {
  'En stock': 'bg-primary/15 text-primary border-transparent',
  'Poco stock': 'bg-chart-5/40 text-foreground border-transparent',
  'Agotado': 'bg-destructive/10 text-destructive border-transparent',
}

useHead({ title: 'Panel | Sweet Love Admin' })
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="from-secondary to-background flex flex-col items-start gap-2 rounded-xl bg-gradient-to-r p-8 lg:col-span-2">
        <h1 class="font-heading text-2xl font-bold">👋 Hola Maryuri,</h1>
        <p class="text-muted-foreground">
          Bienvenida a tu panel de Sweet Love. Revisa tus ventas, sigue tu progreso
          y descubre ideas para endulzar a más clientes.
        </p>
        <Button class="mt-2" as-child>
          <NuxtLink to="/reports">Ver reportes</NuxtLink>
        </Button>
      </div>

      <Card>
        <CardContent class="h-full">
          <Carousel class="flex h-full w-full flex-col gap-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">Ideas para ti</h2>
              <div class="flex gap-2">
                <CarouselPrevious class="static size-7 translate-y-0" />
                <CarouselNext class="static size-7 translate-y-0" />
              </div>
            </div>
            <CarouselContent>
              <CarouselItem v-for="idea in ideas" :key="idea.title">
                <div class="flex flex-col gap-2">
                  <h3 class="font-semibold">{{ idea.title }}</h3>
                  <p class="text-muted-foreground text-sm">{{ idea.description }}</p>
                  <Button variant="outline" size="sm" class="mt-1 self-start" as-child>
                    <NuxtLink to="/blog">Leer más</NuxtLink>
                  </Button>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.label">
        <CardContent class="flex flex-col gap-6">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-full" :class="stat.iconClass">
              <component :is="stat.icon" class="size-5" />
            </div>
            <span class="text-muted-foreground">{{ stat.label }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-2xl font-bold">{{ stat.value }}</span>
            <span
              class="flex items-center gap-1 text-sm"
              :class="stat.isPositive ? 'text-primary' : 'text-destructive'"
            >
              {{ stat.change }}
              <IconTrendingUp v-if="stat.isPositive" class="size-4" />
              <IconTrendingDown v-else class="size-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 xl:grid-cols-3">
      <Card class="xl:col-span-2">
        <CardHeader>
          <CardTitle>Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs default-value="income">
            <TabsList class="bg-muted grid h-auto w-full grid-cols-1 gap-1.5 rounded-xl p-1.5 sm:grid-cols-2">
              <TabsTrigger
                value="income"
                class="data-active:border-primary/50 data-active:bg-primary/15 data-active:text-foreground dark:data-active:border-primary/50 dark:data-active:bg-primary/15 dark:data-active:text-foreground h-auto flex-col items-start gap-1.5 rounded-lg p-3"
              >
                <span class="flex items-center gap-2 text-xs">
                  <span class="bg-primary size-2 rounded-full" />
                  Ingresos totales
                </span>
                <span class="text-foreground text-lg font-semibold">$12.450.000</span>
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                class="data-active:border-primary/50 data-active:bg-primary/15 data-active:text-foreground dark:data-active:border-primary/50 dark:data-active:bg-primary/15 dark:data-active:text-foreground h-auto flex-col items-start gap-1.5 rounded-lg p-3"
              >
                <span class="flex items-center gap-2 text-xs">
                  <span class="bg-chart-2 size-2 rounded-full" />
                  Gastos totales
                </span>
                <span class="text-foreground text-lg font-semibold">$5.870.000</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="income">
              <ClientOnly>
                <ApexChart type="area" height="300" :options="incomeChartOptions" :series="incomeChartSeries" />
              </ClientOnly>
            </TabsContent>
            <TabsContent value="expenses">
              <ClientOnly>
                <ApexChart type="area" height="300" :options="expensesChartOptions" :series="expensesChartSeries" />
              </ClientOnly>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por producto</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <ClientOnly>
            <ApexChart type="donut" height="220" :options="donutChartOptions" :series="donutChartSeries" />
          </ClientOnly>
          <div class="flex flex-col gap-2">
            <div
              v-for="product in productSales"
              :key="product.name"
              class="flex items-center justify-between text-sm"
            >
              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-full" :style="{ backgroundColor: product.color }" />
                {{ product.name }}
              </span>
              <span class="flex gap-2">
                <span class="font-medium">{{ product.amount }}</span>
                <span class="text-muted-foreground">{{ product.percent }}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 xl:grid-cols-3">
      <Card class="xl:col-span-2">
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Envío</TableHead>
                <TableHead>Fecha de entrega</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead class="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="order in orders" :key="order.id + order.date">
                <TableCell class="font-medium">{{ order.id }}</TableCell>
                <TableCell>{{ order.amount }}</TableCell>
                <TableCell>{{ order.shipping }}</TableCell>
                <TableCell>{{ order.date }}</TableCell>
                <TableCell>
                  <Badge :class="orderStatusClass[order.status]">{{ order.status }}</Badge>
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="outline" size="sm" as-child>
                    <NuxtLink to="/orders">Ver</NuxtLink>
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por ciudad</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div v-for="entry in salesByCity" :key="entry.city" class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-sm">
              <span>{{ entry.city }}</span>
              <span class="font-medium">{{ entry.amount }}</span>
            </div>
            <Progress :model-value="entry.percent" class="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Productos más vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Ventas</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="product in topProducts" :key="product.name">
              <TableCell class="font-medium">{{ product.name }}</TableCell>
              <TableCell>{{ product.sales }}</TableCell>
              <TableCell>{{ product.revenue }}</TableCell>
              <TableCell>
                <span class="flex items-center gap-1.5">
                  <IconStarFilled class="text-chart-5 size-4" />
                  {{ product.rating }}
                </span>
              </TableCell>
              <TableCell>
                <Badge :class="stockBadgeClass[product.stock]">{{ product.stock }}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
