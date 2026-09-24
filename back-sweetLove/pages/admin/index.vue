<!--
  @file pages/admin/index.vue
  @description Panel de administración principal (Dashboard) de la plataforma Sweet Love.
  Consume los indicadores generales desde la API (/api/dashboard) respaldada por MySQL y los
  visualiza mediante tarjetas de métricas, gráficos interactivos (ApexCharts) y tablas de datos.

  @project Sweet Love E-Commerce
  @module Admin/Dashboard
-->
<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

import {
  IconCoin,
  IconShoppingCart,
  IconStarFilled,
} from '@tabler/icons-vue'
import type { Component } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Progress } from '~/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '~/components/ui/carousel'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { BRAND_COLORS } from '~/lib/constants'

/** Estructura para un pedido reciente dentro del dashboard */
interface DashboardOrder {
  id: string
  amount: number
  date: string
  status: string
  customer: string
}

/** Estructura de producto para el reporte de stock e ingresos */
interface DashboardProduct {
  name: string
  sales: number
  revenue: number
  stock: number
}

/** Estructura general de respuesta entregada por el endpoint /api/dashboard */
interface DashboardData {
  orders: number
  revenue: number
  orderValue: number
  cancellationRate: number
  productSales: Array<{ name: string; units: number; revenue: number }>
  citySales: Array<{ city: string; revenue: number; percent: number }>
  recentOrders: DashboardOrder[]
  topProducts: DashboardProduct[]
  weeklyRevenue: Array<{ day: string; revenue: number }>
}

/** Configuración de tarjetas de métricas cuantitativas */
interface StatCard {
  label: string
  value: string
  change: string
  isPositive: boolean
  icon: Component
  iconClass: string
}

const { chartTheme } = useChartTheme()

/**
 * Consulta asíncrona de datos del dashboard desde la API REST.
 */
const { data, pending, error, refresh } = await useFetch<DashboardData>('/api/dashboard', {
  default: () => ({
    orders: 0,
    revenue: 0,
    orderValue: 0,
    cancellationRate: 0,
    productSales: [],
    citySales: [],
    recentOrders: [],
    topProducts: [],
    weeklyRevenue: [],
  }),
})

useHead({ title: 'Panel | Sweet Love Admin' })

/**
 * Convierte valores numéricos a formato de moneda local (COP).
 * @param {number} value - Monto en pesos
 * @returns {string} Texto formateado
 */
const formatMoney = (value: number): string => formatCop(Number(value) || 0)

/**
 * Mapeo de estados de pedido almacenados en BD a estilos de Badges.
 */
const orderStatusClass: Record<string, string> = {
  Enviado: 'bg-primary/15 text-primary border-transparent',
  Pendiente: 'bg-chart-5/40 text-foreground border-transparent',
  Cancelado: 'bg-destructive/10 text-destructive border-transparent',
  Completado: 'bg-secondary text-secondary-foreground border-transparent',
  'En preparación': 'bg-muted text-foreground border-transparent',
}

/**
 * Evalúa el nivel de existencias y retorna una etiqueta descriptiva.
 * @param {number} stock - Unidades disponibles
 * @returns {string} Estado del stock
 */
const stockStatus = (stock: number): string => {
  if (stock <= 0) return 'Agotado'
  if (stock <= 5) return 'Poco stock'
  return 'En stock'
}

/**
 * Clases CSS según la disponibilidad del producto.
 */
const stockBadgeClass: Record<string, string> = {
  'En stock': 'bg-primary/15 text-primary border-transparent',
  'Poco stock': 'bg-chart-5/40 text-foreground border-transparent',
  Agotado: 'bg-destructive/10 text-destructive border-transparent',
}

/**
 * Métricas calculadas para las tarjetas superiores del panel.
 */
const stats = computed<StatCard[]>(() => [
  {
    label: 'Pedidos',
    value: data.value.orders.toLocaleString('es-CO'),
    change: 'Registros actuales',
    isPositive: true,
    icon: IconShoppingCart,
    iconClass: 'bg-secondary text-secondary-foreground',
  },
  {
    label: 'Ingresos aprobados',
    value: formatMoney(data.value.revenue),
    change: 'Pagos aprobados',
    isPositive: true,
    icon: IconCoin,
    iconClass: 'bg-primary/15 text-primary',
  },
  {
    label: 'Tasa de cancelación',
    value: `${data.value.cancellationRate.toFixed(1)}%`,
    change: 'Según pedidos registrados',
    isPositive: data.value.cancellationRate < 5,
    icon: IconShoppingCart,
    iconClass: 'bg-chart-5/40 text-foreground',
  },
])

/**
 * Normaliza cadenas de texto en objetos Date nativos de JavaScript.
 * @param {string} value - Cadena de fecha ISO o DD/MM/YYYY
 * @returns {Date|null}
 */
const parseDateValue = (value: string): Date | null => {
  const normalized = String(value ?? '').trim()
  if (!normalized) return null

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const localMatch = normalized.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/)
  if (localMatch) {
    const [, day, month, year] = localMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(normalized)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** Categorías de días formateadas para el eje X del gráfico de área */
const chartCategories = computed(() => data.value.weeklyRevenue.map((entry) => {
  const date = parseDateValue(entry.day)
  return date
    ? new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date).replace('.', '')
    : '—'
}))

/** Opciones de renderizado para el gráfico de área de ApexCharts */
const incomeChartOptions = computed(() => ({
  chart: { type: 'area', height: 300, toolbar: { show: false }, fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
  xaxis: { categories: chartCategories.value, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { formatter: (value: number) => formatMoney(value) } },
  grid: { borderColor: chartTheme.value.gridColor, strokeDashArray: 4 },
  tooltip: { theme: chartTheme.value.tooltipTheme },
  colors: [BRAND_COLORS.green],
}))

const incomeChartSeries = computed(() => [
  { name: 'Ingresos aprobados', data: data.value.weeklyRevenue.map((entry) => entry.revenue) },
])

const productSalesTotal = computed(() => data.value.productSales.reduce((sum, item) => sum + item.revenue, 0))

/** Lista procesada para el gráfico tipo Donut con colores de marca */
const productSalesList = computed(() => data.value.productSales.map((product, index) => {
  const palette = [BRAND_COLORS.green, BRAND_COLORS.rose, BRAND_COLORS.pinkDeep, BRAND_COLORS.greenDark]
  const percent = productSalesTotal.value > 0 ? (product.revenue / productSalesTotal.value) * 100 : 0
  return { ...product, percent, color: palette[index % palette.length] }
}))

/** Configuración visual del gráfico Donut */
const donutChartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  labels: productSalesList.value.map((product) => product.name),
  colors: productSalesList.value.map((product) => product.color),
  legend: { show: false },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  plotOptions: { pie: { donut: { size: '78%' } } },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))

const donutChartSeries = computed(() => productSalesList.value.map((product) => product.percent))

/** Sugerencias breves para la sección de Carrusel */
const ideas = [
  { title: 'Revisa los pedidos pendientes', description: 'Consulta los pedidos que requieren seguimiento desde el módulo de pedidos.' },
  { title: 'Mantén actualizado el catálogo', description: 'Ajusta precios y existencias desde Productos cuando cambien.' },
  { title: 'Revisa los pagos', description: 'Contrasta los estados de los pagos antes de entregar un pedido.' },
]

/**
 * Formatea cadenas de fechas para la tabla de pedidos.
 * @param {string} value - Fecha sin formato
 * @returns {string} Fecha legible
 */
const formatDate = (value: string): string => {
  const date = parseDateValue(value)
  if (!date) return 'Fecha no disponible'

  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

/** Productos destacados con la etiqueta de stock calculada */
const topProducts = computed(() => data.value.topProducts.map((product) => ({
  ...product,
  stockLabel: stockStatus(product.stock),
})))
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Encabezado y Carrusel de Consejos -->
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="from-secondary to-background flex flex-col items-start gap-2 rounded-xl bg-gradient-to-r p-8 lg:col-span-2">
        <h1 class="font-heading text-2xl font-bold">👋 Hola Maryuri,</h1>
        <p class="text-muted-foreground">
          Bienvenida a tu panel de Sweet Love. Revisa las ventas y el estado real de tu negocio.
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
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </CardContent>
      </Card>
    </div>

    <!-- Banner de error en la API -->
    <div v-if="error" class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      No se pudieron cargar todos los indicadores. Comprueba que MySQL y la API estén activos.
      <Button variant="outline" size="sm" class="ml-2" @click="refresh">Reintentar</Button>
    </div>

    <!-- Tarjetas con KPIs Principales -->
    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.label">
        <CardContent class="flex flex-col gap-6">
          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-full" :class="stat.iconClass">
              <component :is="stat.icon" class="size-5" />
            </div>
            <span class="text-muted-foreground">{{ stat.label }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-2xl font-bold">{{ pending ? '...' : stat.value }}</span>
            <span class="text-muted-foreground text-xs">{{ stat.change }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Gráficos de Ingresos y Productos -->
    <div class="grid gap-6 xl:grid-cols-3">
      <Card class="xl:col-span-2">
        <CardHeader>
          <CardTitle>Ingresos aprobados de los últimos días</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs default-value="income">
            <TabsList class="bg-muted grid h-auto w-full grid-cols-1 gap-1.5 rounded-xl p-1.5 sm:grid-cols-2">
              <TabsTrigger value="income" class="data-active:border-primary/50 data-active:bg-primary/15 data-active:text-foreground h-auto flex-col items-start gap-1.5 rounded-lg p-3">
                <span class="flex items-center gap-2 text-xs"><span class="bg-primary size-2 rounded-full" />Ingresos aprobados</span>
                <span class="text-foreground text-lg font-semibold">{{ formatMoney(data.revenue) }}</span>
              </TabsTrigger>
              <TabsTrigger value="orders" class="data-active:border-primary/50 data-active:bg-primary/15 data-active:text-foreground h-auto flex-col items-start gap-1.5 rounded-lg p-3">
                <span class="flex items-center gap-2 text-xs"><span class="bg-secondary-foreground size-2 rounded-full" />Valor de pedidos</span>
                <span class="text-foreground text-lg font-semibold">{{ formatMoney(data.orderValue) }}</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="income">
              <ClientOnly>
                <ApexChart type="area" height="300" :options="incomeChartOptions" :series="incomeChartSeries" />
              </ClientOnly>
            </TabsContent>
            <TabsContent value="orders">
              <div class="flex h-[300px] items-center justify-center text-center text-muted-foreground">
                El valor acumulado de los pedidos registrados es <strong class="ml-1 text-foreground">{{ formatMoney(data.orderValue) }}</strong>.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ventas por producto</CardTitle></CardHeader>
        <CardContent class="flex flex-col gap-4">
          <ClientOnly>
            <ApexChart v-if="donutChartSeries.length" type="donut" height="220" :options="donutChartOptions" :series="donutChartSeries" />
            <div v-else class="flex h-[220px] items-center justify-center text-sm text-muted-foreground">No hay ventas registradas.</div>
          </ClientOnly>
          <div class="flex flex-col gap-2">
            <div v-for="product in productSalesList" :key="product.name" class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-2"><span class="size-2.5 rounded-full" :style="{ backgroundColor: product.color }" />{{ product.name }}</span>
              <span class="flex gap-2"><span class="font-medium">{{ formatMoney(product.revenue) }}</span><span class="text-muted-foreground">{{ product.percent.toFixed(1) }}%</span></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Pedidos Recientes y Ventas por Ciudad -->
    <div class="grid gap-6 xl:grid-cols-3">
      <Card class="xl:col-span-2">
        <CardHeader><CardTitle>Pedidos recientes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Cliente</TableHead><TableHead>Monto</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead><TableHead class="text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow v-for="order in data.recentOrders" :key="order.id">
                <TableCell class="font-medium">#{{ order.id }}</TableCell>
                <TableCell>{{ order.customer }}</TableCell>
                <TableCell>{{ formatMoney(order.amount) }}</TableCell>
                <TableCell>{{ formatDate(order.date) }}</TableCell>
                <TableCell><Badge :class="orderStatusClass[order.status] ?? 'bg-muted text-foreground border-transparent'">{{ order.status }}</Badge></TableCell>
                <TableCell class="text-right"><Button variant="outline" size="sm" as-child><NuxtLink to="/orders">Ver</NuxtLink></Button></TableCell>
              </TableRow>
              <TableRow v-if="!data.recentOrders.length"><TableCell colspan="6" class="py-8 text-center text-muted-foreground">No hay pedidos registrados.</TableCell></TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ventas por ciudad</CardTitle></CardHeader>
        <CardContent class="flex flex-col gap-4">
          <div v-for="entry in data.citySales" :key="entry.city" class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between text-sm"><span>{{ entry.city }}</span><span class="font-medium">{{ formatMoney(entry.revenue) }}</span></div>
            <Progress :model-value="entry.percent" class="h-1.5" />
          </div>
          <p v-if="!data.citySales.length" class="text-sm text-muted-foreground">No hay ventas por ciudad para mostrar.</p>
        </CardContent>
      </Card>
    </div>

    <!-- Productos más vendidos -->
    <Card>
      <CardHeader><CardTitle>Productos más vendidos</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Unidades</TableHead><TableHead>Ingresos</TableHead><TableHead>Estado del stock</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow v-for="product in topProducts" :key="product.name">
              <TableCell class="font-medium">{{ product.name }}</TableCell>
              <TableCell>{{ product.sales }}</TableCell>
              <TableCell>{{ formatMoney(product.revenue) }}</TableCell>
              <TableCell><span class="flex items-center gap-1.5"><IconStarFilled class="text-chart-5 size-4" /> <Badge :class="stockBadgeClass[product.stockLabel]">{{ product.stockLabel }}</Badge></span></TableCell>
            </TableRow>
            <TableRow v-if="!topProducts.length"><TableCell colspan="4" class="py-8 text-center text-muted-foreground">No hay productos vendidos registrados.</TableCell></TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>