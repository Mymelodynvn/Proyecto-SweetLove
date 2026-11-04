<!-- back-to-top.vue — botón flotante, siempre visible, que sube al inicio de la página del panel -->
<script setup lang="ts">
import { IconArrowUp } from '@tabler/icons-vue'
import { Button } from '~/components/ui/button'

// Sube suavemente al inicio de la página
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<template>
  <Button
    size="icon-lg"
    class="fixed right-6 bottom-6 z-40 rounded-full shadow-lg"
    aria-label="Volver arriba"
    @click="scrollToTop"
  >
    <IconArrowUp class="size-5" />
  </Button>
</template>
