<!-- auth.vue — layout de las pantallas de acceso (sin barra lateral) -->
<script setup lang="ts">
import { IconCake } from '@tabler/icons-vue'
</script>

<template>
  <div class="from-secondary via-background to-background flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b p-4">
    <!-- Enlace normal a la tienda: la tienda está fuera del router de Nuxt -->
    <a href="/tienda/index.html" class="flex items-center gap-2">
      <span class="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full">
        <IconCake class="size-6" />
      </span>
      <span class="font-heading text-2xl font-bold">Sweet Love</span>
    </a>
    <slot />
  </div>
</template>
