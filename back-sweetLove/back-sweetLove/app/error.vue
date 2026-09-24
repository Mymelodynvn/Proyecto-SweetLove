<script setup lang="ts">
import type { NuxtError } from '#app'
import { IconCake } from '@tabler/icons-vue'
import { Button } from '~/components/ui/button'

const props = defineProps<{ error: NuxtError }>()

const goHome = () => clearError({ redirect: '/' })

useHead({ title: `Error ${props.error.statusCode} | Sweet Love Admin` })
</script>

<template>
  <div class="from-secondary via-background to-background flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b p-4">
    <div class="flex items-center gap-2">
      <span class="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full">
        <IconCake class="size-6" />
      </span>
      <span class="font-heading text-2xl font-bold">Sweet Love</span>
    </div>
    <div class="flex flex-col items-center gap-4 text-center">
      <p class="text-primary font-heading text-8xl font-bold">{{ error.statusCode }}</p>
      <h1 class="text-2xl font-semibold">
        {{ error.statusCode === 404 ? 'Página no encontrada' : 'Ocurrió un error' }}
      </h1>
      <p class="text-muted-foreground max-w-sm">
        {{ error.statusCode === 404
          ? 'Lo sentimos, la página que buscas no existe o fue movida.'
          : 'Algo salió mal. Intenta volver al panel.' }}
      </p>
      <Button @click="goHome">Volver al panel</Button>
    </div>
  </div>
</template>
