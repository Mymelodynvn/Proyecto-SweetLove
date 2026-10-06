<!--
  Módulo de reportes de Sweet Love.
  Todos los indicadores se obtienen mediante consultas reales a MySQL.
-->
<script setup lang="ts">
import { IconCoin, IconDownload, IconReceipt, IconRepeat, IconShoppingCart, IconShoppingCartX, IconUsers } from '@tabler/icons-vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'

useHead({ title: 'Reportes | Sweet Love Admin' })

const { data } = await useFetch<{
  kpis: { approvedRevenue: number; orderValue: number; totalOrders: number; averageOrder: number; registeredCustomers: number; recurringCustomers: number; cancellationRate: number }
  productSales: Array<{ name: string; units: number; revenue: number }>
  ordersByStatus: Array<{ status: string; count: number }>
  paymentMethods: Array<{ name: string; count: number; amount: number }>
  topCustomers: Array<{ name: string; orderCount: number; totalSpent: number }>
}>('/api/reports', {
  default: () => ({
    kpis: { approvedRevenue: 0, orderValue: 0, totalOrders: 0, averageOrder: 0, registeredCustomers: 0, recurringCustomers: 0, cancellationRate: 0 },
    productSales: [], ordersByStatus: [], paymentMethods: [], topCustomers: [],
  }),
})

/**
 * Da formato de pesos colombianos a un monto.
 * @param value Monto.
 */
const formatMoney = (value: number) => formatCop(value)

/** Descarga los indicadores principales en un archivo CSV. */
const exportReport = () => {
  downloadCsv('reporte-sweet-love.csv', [
    ['Indicador', 'Valor'],
    ['Ingresos aprobados', data.value.kpis.approvedRevenue],
    ['Valor de pedidos', data.value.kpis.orderValue],
    ['Pedidos', data.value.kpis.totalOrders],
    ['Ticket promedio', data.value.kpis.averageOrder],
    ['Clientes registrados', data.value.kpis.registeredCustomers],
    ['Clientes recurrentes', data.value.kpis.recurringCustomers],
    ['Tasa de cancelación', `${data.value.kpis.cancellationRate.toFixed(1)}%`],
  ])
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">Reportes</h1>
        <p class="text-muted-foreground">Indicadores calculados directamente con los datos de Sweet Love.</p>
      </div>
      <Button variant="outline" @click="exportReport"><IconDownload class="size-4" /> Exportar CSV</Button>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <Card><CardContent class="flex flex-col gap-2"><IconCoin class="size-5" /><span class="text-muted-foreground text-sm">Ingresos aprobados</span><strong class="text-2xl">{{ formatMoney(data.kpis.approvedRevenue) }}</strong></CardContent></Card>
      <Card><CardContent class="flex flex-col gap-2"><IconShoppingCart class="size-5" /><span class="text-muted-foreground text-sm">Pedidos</span><strong class="text-2xl">{{ data.kpis.totalOrders }}</strong></CardContent></Card>
      <Card><CardContent class="flex flex-col gap-2"><IconReceipt class="size-5" /><span class="text-muted-foreground text-sm">Ticket promedio</span><strong class="text-2xl">{{ formatMoney(data.kpis.averageOrder) }}</strong></CardContent></Card>
      <Card><CardContent class="flex flex-col gap-2"><IconUsers class="size-5" /><span class="text-muted-foreground text-sm">Clientes registrados</span><strong class="text-2xl">{{ data.kpis.registeredCustomers }}</strong></CardContent></Card>
      <Card><CardContent class="flex flex-col gap-2"><IconRepeat class="size-5" /><span class="text-muted-foreground text-sm">Clientes recurrentes</span><strong class="text-2xl">{{ data.kpis.recurringCustomers }}</strong></CardContent></Card>
      <Card><CardContent class="flex flex-col gap-2"><IconShoppingCartX class="size-5" /><span class="text-muted-foreground text-sm">Tasa de cancelación</span><strong class="text-2xl">{{ data.kpis.cancellationRate.toFixed(1) }}%</strong></CardContent></Card>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Ventas por producto</CardTitle></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Unidades</TableHead><TableHead>Ingresos</TableHead></TableRow></TableHeader>
        <TableBody><TableRow v-for="item in data.productSales" :key="item.name"><TableCell class="font-medium">{{ item.name }}</TableCell><TableCell>{{ item.units }}</TableCell><TableCell>{{ formatMoney(item.revenue) }}</TableCell></TableRow><TableRow v-if="!data.productSales.length"><TableCell colspan="3" class="text-center py-6">No hay ventas registradas.</TableCell></TableRow></TableBody></Table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Pedidos por estado</CardTitle></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Estado</TableHead><TableHead>Pedidos</TableHead></TableRow></TableHeader>
        <TableBody><TableRow v-for="item in data.ordersByStatus" :key="item.status"><TableCell>{{ item.status }}</TableCell><TableCell>{{ item.count }}</TableCell></TableRow></TableBody></Table>
      </CardContent></Card>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Medios de pago</CardTitle></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Medio</TableHead><TableHead>Operaciones</TableHead><TableHead>Monto</TableHead></TableRow></TableHeader>
        <TableBody><TableRow v-for="item in data.paymentMethods" :key="item.name"><TableCell>{{ item.name }}</TableCell><TableCell>{{ item.count }}</TableCell><TableCell>{{ formatMoney(item.amount) }}</TableCell></TableRow></TableBody></Table>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Clientes con mayor gasto</CardTitle></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Pedidos</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
        <TableBody><TableRow v-for="item in data.topCustomers.slice(0, 5)" :key="item.name"><TableCell>{{ item.name }}</TableCell><TableCell>{{ item.orderCount }}</TableCell><TableCell>{{ formatMoney(item.totalSpent) }}</TableCell></TableRow></TableBody></Table>
      </CardContent></Card>
    </div>
  </div>
</template>
