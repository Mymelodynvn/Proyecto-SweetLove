<script setup lang="ts">
import { IconAlertTriangle, IconBell, IconShoppingCart, IconStar } from '@tabler/icons-vue'
import type { Component } from 'vue'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface NotificationItem {
  id: number
  icon: Component
  iconClass: string
  title: string
  detail: string
  time: string
  read: boolean
}

const notifications = ref<NotificationItem[]>([
  {
    id: 1,
    icon: IconShoppingCart,
    iconClass: 'bg-primary/15 text-primary',
    title: 'Nuevo pedido #SL0132',
    detail: 'Laura Gómez pidió una torta personalizada de cumpleaños.',
    time: 'Hace 5 min',
    read: false,
  },
  {
    id: 2,
    icon: IconAlertTriangle,
    iconClass: 'bg-chart-5/25 text-chart-5',
    title: 'Stock bajo',
    detail: 'Quedan 4 unidades de Cupcakes de vainilla (x6).',
    time: 'Hace 1 h',
    read: false,
  },
  {
    id: 3,
    icon: IconStar,
    iconClass: 'bg-secondary text-secondary-foreground',
    title: 'Nueva reseña de 5 estrellas',
    detail: 'Julián Pérez calificó la torta red velvet.',
    time: 'Hace 3 h',
    read: false,
  },
  {
    id: 4,
    icon: IconShoppingCart,
    iconClass: 'bg-primary/15 text-primary',
    title: 'Pedido completado #SL0129',
    detail: 'La entrega de Julián Pérez fue confirmada.',
    time: 'Ayer',
    read: true,
  },
])

const unreadCount = computed(() =>
  notifications.value.filter((notification) => !notification.read).length,
)

const markAsRead = (notification: NotificationItem, selectEvent: Event) => {
  selectEvent.preventDefault()
  notification.read = true
}

const markAllAsRead = () => {
  for (const notification of notifications.value) {
    notification.read = true
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" aria-label="Notificaciones" class="relative">
        <IconBell class="size-5" />
        <Badge
          v-if="unreadCount > 0"
          class="absolute -top-0.5 -right-0.5 size-4 justify-center rounded-full p-0 text-[10px]"
        >
          {{ unreadCount }}
        </Badge>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-96 max-w-[calc(100vw-2rem)]">
      <div class="flex items-center justify-between px-2 py-1.5">
        <span class="text-sm font-semibold">Notificaciones</span>
        <button
          v-if="unreadCount > 0"
          type="button"
          class="text-primary text-xs hover:underline"
          @click="markAllAsRead"
        >
          Marcar todas como leídas
        </button>
      </div>
      <DropdownMenuSeparator />
      <div class="max-h-80 overflow-y-auto">
        <DropdownMenuItem
          v-for="notification in notifications"
          :key="notification.id"
          class="items-start gap-3 py-2.5 whitespace-normal"
          :class="notification.read ? 'opacity-60' : ''"
          @select="markAsRead(notification, $event)"
        >
          <span class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full" :class="notification.iconClass">
            <component :is="notification.icon" class="size-4" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="flex items-center justify-between gap-2">
              <span class="truncate text-sm font-medium">{{ notification.title }}</span>
              <span v-if="!notification.read" class="bg-primary size-2 shrink-0 rounded-full" />
            </span>
            <span class="text-muted-foreground line-clamp-2 text-xs">{{ notification.detail }}</span>
            <span class="text-muted-foreground text-xs">{{ notification.time }}</span>
          </span>
        </DropdownMenuItem>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <NuxtLink to="/orders" class="justify-center text-sm font-medium">
          Ver todos los pedidos
        </NuxtLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
