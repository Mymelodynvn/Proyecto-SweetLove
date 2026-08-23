<script setup lang="ts">
import { IconTool } from '@tabler/icons-vue'
import { Button } from '~/components/ui/button'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Mantenimiento | Sweet Love Admin' })
</script>

<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <span class="bg-secondary text-secondary-foreground flex size-16 items-center justify-center rounded-full">
      <IconTool class="size-8" />
    </span>
    <h1 class="text-2xl font-semibold">Estamos en mantenimiento</h1>
    <p class="text-muted-foreground max-w-sm">
      Estamos horneando mejoras para el panel. Vuelve a intentarlo en unos minutos.
    </p>
    <Button as-child>
      <NuxtLink to="/">Volver al panel</NuxtLink>
    </Button>
  </div>
</template>
