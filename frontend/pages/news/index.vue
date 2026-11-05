<!-- Novedades: mensajes que las personas envían desde el formulario "Contáctanos" de la tienda -->
<script setup lang="ts">
import { IconClock, IconInbox, IconPhone, IconRefresh, IconTrash } from '@tabler/icons-vue'
import type { ContactMessage } from '~/composables/use-contact-messages'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

useHead({ title: 'Novedades | Sweet Love Admin' })

const { messages, loadFromStorage, removeMessage, refresh } = useContactMessages()

onMounted(loadFromStorage)

const isRefreshing = ref(false)

// Pide de nuevo los mensajes al servidor para ver los que llegaron hace poco
const reload = async () => {
  isRefreshing.value = true
  await refresh()
  isRefreshing.value = false
}

// Da formato legible a la fecha del mensaje ("YYYY-MM-DD HH:MM" -> "4 nov 2026, 3:30 p. m."), recibe value
const formatDate = (value: string) => {
  const [datePart = '', timePart = ''] = value.split(' ')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(year, month - 1, day, hour || 0, minute || 0))
}

// Deja solo los dígitos del celular, para el enlace de llamada, recibe phone
const dialNumber = (phone: string) => phone.replace(/[^\d+]/g, '')

const messagePendingDeletion = ref<ContactMessage | null>(null)
const isDeleteDialogOpen = ref(false)
const deleteError = ref('')

// Pide confirmación antes de eliminar un mensaje, recibe message
const requestDeletion = (message: ContactMessage) => {
  messagePendingDeletion.value = message
  deleteError.value = ''
  isDeleteDialogOpen.value = true
}

// Elimina el mensaje en el servidor tras la confirmación
const confirmDeletion = async () => {
  if (messagePendingDeletion.value) {
    try {
      await removeMessage(messagePendingDeletion.value.id)
    } catch (error) {
      console.error('No fue posible eliminar el mensaje.', error)
      deleteError.value = apiErrorMessage(error, 'No fue posible eliminar el mensaje. Intenta de nuevo.')
      return
    }
  }
  isDeleteDialogOpen.value = false
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="font-heading text-2xl font-bold">
          Novedades
          <Badge v-if="messages.length" variant="secondary" class="ml-2 align-middle">{{ messages.length }}</Badge>
        </h1>
        <p class="text-muted-foreground">Mensajes que las personas envían desde el formulario «Contáctanos» de la tienda.</p>
      </div>
      <Button variant="outline" :disabled="isRefreshing" @click="reload">
        <IconRefresh class="size-4" :class="{ 'animate-spin': isRefreshing }" />
        Actualizar
      </Button>
    </div>

    <p v-if="deleteError && !isDeleteDialogOpen" class="text-destructive text-sm">{{ deleteError }}</p>

    <Card v-if="!messages.length">
      <CardContent class="text-muted-foreground flex flex-col items-center gap-3 py-12 text-center">
        <IconInbox class="size-10" />
        <p>Aún no hay novedades. Cuando alguien escriba desde «Contáctanos», su mensaje aparecerá aquí.</p>
      </CardContent>
    </Card>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="item in messages" :key="item.id">
        <CardHeader class="flex flex-row items-start justify-between gap-3">
          <div class="min-w-0">
            <CardTitle class="break-words">{{ item.subject }}</CardTitle>
            <p class="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
              <IconClock class="size-3.5" />
              {{ formatDate(item.createdAt) }}
            </p>
          </div>
          <Button variant="ghost" size="icon" class="text-destructive shrink-0" aria-label="Eliminar mensaje" @click="requestDeletion(item)">
            <IconTrash class="size-4" />
          </Button>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <p class="text-sm break-words whitespace-pre-line">{{ item.message }}</p>
          <div class="border-t pt-3 text-sm">
            <p class="font-medium">{{ item.name }}</p>
            <a :href="`tel:${dialNumber(item.phone)}`" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <IconPhone class="size-3.5" />
              {{ item.phone }}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>

    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este mensaje?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará el mensaje «{{ messagePendingDeletion?.subject }}» de {{ messagePendingDeletion?.name }}. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            @click="confirmDeletion"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
