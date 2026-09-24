<script setup lang="ts">
import {
  IconCoin,
  IconDownload,
  IconReceipt,
  IconRepeat,
  IconShoppingCart,
  IconShoppingCartX,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-vue'
import type { Component } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { BRAND_COLORS } from '~/lib/constants'

interface ReportKpi {
  label: string
  value: string
  change: string
  isPositive: boolean
  icon: Component
  iconClass: string
}

useHead({ title: 'Reportes | Sweet Love Admin' })

const PERIODS = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '12m', label: 'Último año' },
] as const

type ReportPeriod = (typeof PERIODS)[number]['value']

const selectedPeriod = ref<ReportPeriod>('6m')

const kpis: ReportKpi[] = [
  { label: 'Ingresos del periodo', value: '$68.400.000', change: '12.4%', isPositive: true, icon: IconCoin, iconClass: 'bg-primary/15 text-primary' },
  { label: 'Pedidos', value: '1.860', change: '8.1%', isPositive: true, icon: IconShoppingCart, iconClass: 'bg-secondary text-secondary-foreground' },
  { label: 'Ticket promedio', value: '$36.700', change: '3.9%', isPositive: true, icon: IconReceipt, iconClass: 'bg-chart-5/25 text-chart-5' },
  { label: 'Clientes nuevos', value: '214', change: '1.7%', isPositive: false, icon: IconUsers, iconClass: 'bg-primary/15 text-primary' },
  { label: 'Clientes recurrentes', value: '68%', change: '4.2%', isPositive: true, icon: IconRepeat, iconClass: 'bg-secondary text-secondary-foreground' },
  { label: 'Tasa de cancelación', value: '2.3%', change: '0.4%', isPositive: true, icon: IconShoppingCartX, iconClass: 'bg-destructive/10 text-destructive' },
]

interface RevenueSeries {
  title: string
  categories: string[]
  data: number[]
}

// Revenue in thousands of COP per bucket.
const revenueByPeriod: Record<ReportPeriod, RevenueSeries> = {
  today: {
    title: 'Ingresos de hoy (por hora)',
    categories: ['8 am', '10 am', '12 pm', '2 pm', '4 pm', '6 pm', '8 pm'],
    data: [45, 120, 260, 180, 210, 340, 195],
  },
  week: {
    title: 'Ingresos de esta semana',
    categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    data: [420, 380, 510, 460, 620, 890, 760],
  },
  '6m': {
    title: 'Ingresos por mes',
    categories: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
    data: [9800, 10400, 11250, 10900, 12100, 13950],
  },
  '12m': {
    title: 'Ingresos por mes',
    categories: ['Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
    data: [7200, 7900, 9400, 12800, 8600, 9900, 9800, 10400, 11250, 10900, 12100, 13950],
  },
}

const selectedRevenue = computed(() => revenueByPeriod[selectedPeriod.value])

const { chartTheme } = useChartTheme()

const formatThousandsLabel = (value: number) =>
  value >= 1000 ? `$${(value / 1000).toFixed(1)}M` : `$${Math.round(value)}k`

const monthlyChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  colors: [BRAND_COLORS.green],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: selectedRevenue.value.categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { formatter: formatThousandsLabel } },
  grid: { borderColor: chartTheme.value.gridColor, strokeDashArray: 4 },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))

const monthlyChartSeries = computed(() => [
  { name: 'Ingresos (miles)', data: selectedRevenue.value.data },
])

const salesByCategory = [
  { name: 'Tortas', percent: 46, color: BRAND_COLORS.green },
  { name: 'Cupcakes', percent: 22, color: BRAND_COLORS.rose },
  { name: 'Cheesecakes', percent: 15, color: BRAND_COLORS.pinkDeep },
  { name: 'Galletas', percent: 10, color: BRAND_COLORS.greenDark },
  { name: 'Otros postres', percent: 7, color: '#D9B98A' },
]

const categoryChartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  labels: salesByCategory.map((category) => category.name),
  colors: salesByCategory.map((category) => category.color),
  legend: { show: false },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  plotOptions: { pie: { donut: { size: '76%' } } },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))
const categoryChartSeries = salesByCategory.map((category) => category.percent)

const ordersByStatus = [
  { status: 'Completado', count: 1520 },
  { status: 'Enviado', count: 138 },
  { status: 'En preparación', count: 96 },
  { status: 'Pendiente', count: 64 },
  { status: 'Cancelado', count: 42 },
]

const ordersStatusChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  colors: [BRAND_COLORS.green, BRAND_COLORS.greenDark, BRAND_COLORS.rose, '#D9B98A', '#B36B6B'],
  plotOptions: { bar: { horizontal: true, borderRadius: 5, distributed: true, barHeight: '55%' } },
  dataLabels: { enabled: false },
  legend: { show: false },
  xaxis: {
    categories: ordersByStatus.map((entry) => entry.status),
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  grid: { borderColor: chartTheme.value.gridColor, strokeDashArray: 4 },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))
const ordersStatusChartSeries = [
  { name: 'Pedidos', data: ordersByStatus.map((entry) => entry.count) },
]

const customersChartOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  colors: [BRAND_COLORS.green, BRAND_COLORS.rose],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.04 },
  },
  xaxis: {
    categories: ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  grid: { borderColor: chartTheme.value.gridColor, strokeDashArray: 4 },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))
const customersChartSeries = [
  { name: 'Clientes nuevos', data: [32, 38, 35, 41, 34, 34] },
  { name: 'Clientes recurrentes', data: [96, 104, 118, 122, 131, 140] },
]

const topCustomers = [
  { name: 'Laura Gómez', orderCount: 14, totalSpent: '$1.680.000' },
  { name: 'Andrés Mejía', orderCount: 11, totalSpent: '$980.000' },
  { name: 'Carlos Restrepo', orderCount: 8, totalSpent: '$720.000' },
  { name: 'Ana María Torres', orderCount: 6, totalSpent: '$540.000' },
  { name: 'Julián Pérez', orderCount: 3, totalSpent: '$310.000' },
]

// Extra business stats: order distribution across the week and sales channels.
const ordersByWeekday = [96, 84, 102, 118, 164, 236, 198]

const weekdayChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  colors: [BRAND_COLORS.rose],
  plotOptions: { bar: { borderRadius: 5, columnWidth: '55%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  grid: { borderColor: chartTheme.value.gridColor, strokeDashArray: 4 },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))
const weekdayChartSeries = [{ name: 'Pedidos', data: ordersByWeekday }]

const salesChannels = [
  { name: 'WhatsApp', percent: 48, color: BRAND_COLORS.green },
  { name: 'Instagram', percent: 27, color: BRAND_COLORS.rose },
  { name: 'Sitio web', percent: 17, color: BRAND_COLORS.pinkDeep },
  { name: 'Punto físico', percent: 8, color: BRAND_COLORS.greenDark },
]

const channelsChartOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit', foreColor: chartTheme.value.foreColor },
  labels: salesChannels.map((channel) => channel.name),
  colors: salesChannels.map((channel) => channel.color),
  legend: { show: false },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  plotOptions: { pie: { donut: { size: '76%' } } },
  tooltip: { theme: chartTheme.value.tooltipTheme },
}))
const channelsChartSeries = salesChannels.map((channel) => channel.percent)

const exportReport = () => {
  const period = selectedRevenue.value
  downloadCsv(`reporte-ingresos-${selectedPeriod.value}.csv`, [
    ['Periodo', 'Ingresos (miles COP)'],
    ...period.categories.map((bucketLabel, bucketIndex) => [bucketLabel, period.data[bucketIndex] ?? 0]),
  ])
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">Reportes</h1>
        <p class="text-muted-foreground">El desempeño de Sweet Love en un vistazo.</p>
      </div>
      <div class="flex items-center gap-2">
        <Select v-model="selectedPeriod">
          <SelectTrigger class="w-44">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="period in PERIODS" :key="period.value" :value="period.value">
              {{ period.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" @click="exportReport">
          <IconDownload class="size-4" />
          Exportar CSV
        </Button>
      </div>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="kpi in kpis" :key="kpi.label">
        <CardContent class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-full" :class="kpi.iconClass">
              <component :is="kpi.icon" class="size-5" />
            </span>
            <span class="text-muted-foreground text-sm">{{ kpi.label }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-2xl font-bold">{{ kpi.value }}</span>
            <span
              class="flex items-center gap-1 text-sm"
              :class="kpi.isPositive ? 'text-primary' : 'text-destructive'"
            >
              {{ kpi.change }}
              <IconTrendingUp v-if="kpi.isPositive" class="size-4" />
              <IconTrendingDown v-else class="size-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 xl:grid-cols-3">
      <Card class="xl:col-span-2">
        <CardHeader>
          <CardTitle>{{ selectedRevenue.title }}</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientOnly>
            <ApexChart type="bar" height="300" :options="monthlyChartOptions" :series="monthlyChartSeries" />
          </ClientOnly>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por categoría</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <ClientOnly>
            <ApexChart type="donut" height="210" :options="categoryChartOptions" :series="categoryChartSeries" />
          </ClientOnly>
          <div class="flex flex-col gap-2">
            <div
              v-for="category in salesByCategory"
              :key="category.name"
              class="flex items-center justify-between text-sm"
            >
              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-full" :style="{ backgroundColor: category.color }" />
                {{ category.name }}
              </span>
              <span class="text-muted-foreground">{{ category.percent }}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Clientes nuevos vs. recurrentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientOnly>
            <ApexChart type="area" height="280" :options="customersChartOptions" :series="customersChartSeries" />
          </ClientOnly>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientOnly>
            <ApexChart type="bar" height="280" :options="ordersStatusChartOptions" :series="ordersStatusChartSeries" />
          </ClientOnly>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Pedidos por día de la semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientOnly>
            <ApexChart type="bar" height="260" :options="weekdayChartOptions" :series="weekdayChartSeries" />
          </ClientOnly>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Canales de venta</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <ClientOnly>
            <ApexChart type="donut" height="200" :options="channelsChartOptions" :series="channelsChartSeries" />
          </ClientOnly>
          <div class="flex flex-col gap-2">
            <div
              v-for="channel in salesChannels"
              :key="channel.name"
              class="flex items-center justify-between text-sm"
            >
              <span class="flex items-center gap-2">
                <span class="size-2.5 rounded-full" :style="{ backgroundColor: channel.color }" />
                {{ channel.name }}
              </span>
              <span class="text-muted-foreground">{{ channel.percent }}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Mejores clientes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Total gastado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="customer in topCustomers" :key="customer.name">
              <TableCell class="font-medium">{{ customer.name }}</TableCell>
              <TableCell>{{ customer.orderCount }}</TableCell>
              <TableCell>{{ customer.totalSpent }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
