<script setup lang="ts">
import { Button } from '~/components/ui/button'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Error 404 | Sweet Love Admin' })
</script>

<template>
  <div class="flex flex-col items-center gap-4 text-center">
    <p class="text-primary font-heading text-8xl font-bold">404</p>
    <h1 class="text-2xl font-semibold">Página no encontrada</h1>
    <p class="text-muted-foreground max-w-sm">
      Lo sentimos, la página que buscas no existe o fue movida.
    </p>
    <Button as-child>
      <NuxtLink to="/">Volver al panel</NuxtLink>
    </Button>
  </div>
</template>
