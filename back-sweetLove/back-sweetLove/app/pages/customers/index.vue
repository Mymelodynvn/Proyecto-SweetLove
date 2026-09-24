<script setup lang="ts">
import { IconMapPin, IconPhone, IconSearch } from '@tabler/icons-vue'
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Separator } from '~/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import type { Customer, CustomerTier } from '~/composables/use-customers'

useHead({ title: 'Clientes | Sweet Love Admin' })

const { customers } = useCustomers()

const searchTerm = ref('')

const filteredCustomers = computed(() =>
  customers.value.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.city}`
      .toLowerCase()
      .includes(searchTerm.value.toLowerCase()),
  ),
)

const tierBadgeClass: Record<CustomerTier, string> = {
  VIP: 'bg-chart-5/40 text-foreground border-transparent',
  Frecuente: 'bg-primary/15 text-primary border-transparent',
  Nuevo: 'bg-secondary text-secondary-foreground border-transparent',
}

const { orders, loadFromStorage: loadOrders } = useOrders()

onMounted(loadOrders)

const selectedCustomer = ref<Customer | null>(null)
const isDetailDialogOpen = ref(false)

const openCustomerDetail = (customer: Customer) => {
  selectedCustomer.value = customer
  isDetailDialogOpen.value = true
}

const selectedCustomerOrders = computed(() =>
  selectedCustomer.value
    ? orders.value.filter((order) => order.customer === selectedCustomer.value?.name)
    : [],
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading text-2xl font-bold">Clientes</h1>
      <p class="text-muted-foreground">Conoce a las personas que endulzan sus días con Sweet Love.</p>
    </div>

    <Card>
      <CardContent class="flex flex-col gap-4">
        <div class="relative max-w-sm">
          <IconSearch class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input v-model="searchTerm" type="search" placeholder="Buscar por nombre, correo o ciudad…" class="pl-9" />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Total gastado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead class="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="customer in filteredCustomers" :key="customer.email">
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
              <TableCell>{{ customer.phone }}</TableCell>
              <TableCell>{{ customer.city }}</TableCell>
              <TableCell>{{ customer.orderCount }}</TableCell>
              <TableCell>{{ formatCop(customer.totalSpent) }}</TableCell>
              <TableCell>
                <Badge :class="tierBadgeClass[customer.tier]">{{ customer.tier }}</Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="outline" size="sm" @click="openCustomerDetail(customer)">Ver</Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredCustomers.length === 0">
              <TableCell colspan="7" class="text-muted-foreground py-8 text-center">
                No se encontraron clientes.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="isDetailDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader class="flex-row items-center gap-3">
          <Avatar class="size-12">
            <AvatarFallback class="bg-secondary text-secondary-foreground font-semibold">
              {{ selectedCustomer ? customerInitials(selectedCustomer.name) : '' }}
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col gap-1 text-left">
            <DialogTitle>{{ selectedCustomer?.name }}</DialogTitle>
            <DialogDescription>{{ selectedCustomer?.email }}</DialogDescription>
          </div>
        </DialogHeader>
        <div v-if="selectedCustomer" class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <Badge :class="tierBadgeClass[selectedCustomer.tier]">{{ selectedCustomer.tier }}</Badge>
            <span class="text-muted-foreground flex items-center gap-1.5 text-sm">
              <IconPhone class="size-4" />
              {{ selectedCustomer.phone }}
            </span>
            <span class="text-muted-foreground flex items-center gap-1.5 text-sm">
              <IconMapPin class="size-4" />
              {{ selectedCustomer.city }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-muted rounded-lg p-3">
              <p class="text-lg font-bold">{{ selectedCustomer.orderCount }}</p>
              <p class="text-muted-foreground text-xs">Pedidos</p>
            </div>
            <div class="bg-muted rounded-lg p-3">
              <p class="text-lg font-bold">{{ formatCop(selectedCustomer.totalSpent) }}</p>
              <p class="text-muted-foreground text-xs">Total gastado</p>
            </div>
          </div>
          <Separator />
          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium">Pedidos recientes</p>
            <div v-if="selectedCustomerOrders.length > 0" class="flex flex-col gap-2">
              <div
                v-for="order in selectedCustomerOrders"
                :key="order.id"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-muted-foreground">{{ order.id }} · {{ order.date }}</span>
                <span class="font-medium">{{ formatCop(order.amount) }}</span>
              </div>
            </div>
            <p v-else class="text-muted-foreground text-sm">Sin pedidos recientes registrados.</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isDetailDialogOpen = false">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
