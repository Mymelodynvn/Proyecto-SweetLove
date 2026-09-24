<script setup lang="ts">
import { IconDownload, IconMapPin, IconPhone, IconUser } from '@tabler/icons-vue'
import type { Order, OrderStatus } from '~/composables/use-orders'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
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

useHead({ title: 'Pedidos | Sweet Love Admin' })

const { orders, loadFromStorage, updateOrderStatus } = useOrders()

onMounted(loadFromStorage)

const statusFilters = ['Todos', ...ORDER_STATUSES]
const selectedStatus = ref('Todos')

const filteredOrders = computed(() =>
  selectedStatus.value === 'Todos'
    ? orders.value
    : orders.value.filter((order) => order.status === selectedStatus.value),
)

const exportOrders = () => {
  downloadCsv('pedidos.csv', [
    ['Pedido', 'Cliente', 'Productos', 'Monto', 'Fecha', 'Estado'],
    ...filteredOrders.value.map((order) => [order.id, order.customer, order.items, order.amount, order.date, order.status]),
  ])
}

const statusBadgeClass: Record<OrderStatus, string> = {
  Pendiente: 'bg-chart-5/40 text-foreground border-transparent',
  'En preparación': 'bg-secondary text-secondary-foreground border-transparent',
  Enviado: 'bg-primary/15 text-primary border-transparent',
  Completado: 'bg-primary/15 text-primary border-transparent',
  Cancelado: 'bg-destructive/10 text-destructive border-transparent',
}

const selectedOrder = ref<Order | null>(null)
const isDetailDialogOpen = ref(false)
const detailStatus = ref<OrderStatus>('Pendiente')

const openOrderDetail = (order: Order) => {
  selectedOrder.value = order
  detailStatus.value = order.status
  isDetailDialogOpen.value = true
}

const saveOrderStatus = () => {
  if (selectedOrder.value) {
    updateOrderStatus(selectedOrder.value.id, detailStatus.value)
  }
  isDetailDialogOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">Pedidos</h1>
        <p class="text-muted-foreground">Gestiona los pedidos de la pastelería.</p>
      </div>
      <Button variant="outline" @click="exportOrders">
        <IconDownload class="size-4" />
        Exportar
      </Button>
    </div>

    <Card>
      <CardContent class="flex flex-col gap-4">
        <Tabs v-model="selectedStatus">
          <TabsList class="flex-wrap">
            <TabsTrigger v-for="status in statusFilters" :key="status" :value="status">
              {{ status }}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead class="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="order in filteredOrders" :key="order.id">
              <TableCell class="font-medium">{{ order.id }}</TableCell>
              <TableCell>{{ order.customer }}</TableCell>
              <TableCell class="max-w-64 truncate">{{ order.items }}</TableCell>
              <TableCell>{{ formatCop(order.amount) }}</TableCell>
              <TableCell>{{ order.date }}</TableCell>
              <TableCell>
                <Badge :class="statusBadgeClass[order.status]">{{ order.status }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="outline" size="sm" @click="openOrderDetail(order)">Ver</Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredOrders.length === 0">
              <TableCell colspan="7" class="text-muted-foreground py-8 text-center">
                No hay pedidos con este estado.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="isDetailDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pedido {{ selectedOrder?.id }}</DialogTitle>
          <DialogDescription>Realizado el {{ selectedOrder?.date }}</DialogDescription>
        </DialogHeader>
        <div v-if="selectedOrder" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2 text-sm">
            <p class="flex items-center gap-2">
              <IconUser class="text-muted-foreground size-4" />
              {{ selectedOrder.customer }}
            </p>
            <p class="flex items-center gap-2">
              <IconPhone class="text-muted-foreground size-4" />
              {{ selectedOrder.phone }}
            </p>
            <p class="flex items-center gap-2">
              <IconMapPin class="text-muted-foreground size-4" />
              {{ selectedOrder.address }}
            </p>
          </div>
          <Separator />
          <div class="flex items-start justify-between gap-4 text-sm">
            <span class="text-muted-foreground">{{ selectedOrder.items }}</span>
            <span class="shrink-0 text-base font-semibold">{{ formatCop(selectedOrder.amount) }}</span>
          </div>
          <Separator />
          <div class="flex flex-col gap-2">
            <Label for="order-status">Estado del pedido</Label>
            <Select id="order-status" v-model="detailStatus">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="status in ORDER_STATUSES" :key="status" :value="status">
                  {{ status }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isDetailDialogOpen = false">Cerrar</Button>
          <Button type="button" @click="saveOrderStatus">Guardar estado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
