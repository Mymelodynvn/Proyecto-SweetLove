<!-- back-to-top.vue — botón flotante que sube al inicio de la página del panel -->
<script setup lang="ts">
import { IconArrowUp } from '@tabler/icons-vue'
import { Button } from '~/components/ui/button'

const visible = ref(false)

// Muestra el botón solo después de bajar una pantalla completa
const updateVisibility = () => {
  visible.value = window.scrollY > window.innerHeight
}

// Sube suavemente al inicio de la página
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', updateVisibility, { passive: true })
})

onBeforeUnmount(() => window.removeEventListener('scroll', updateVisibility))
</script>

<template>
  <Button
    size="icon-lg"
    class="fixed right-6 bottom-6 z-40 rounded-full shadow-lg transition-all duration-200"
    :class="visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'"
    :tabindex="visible ? 0 : -1"
    :aria-hidden="!visible"
    aria-label="Volver arriba"
    @click="scrollToTop"
  >
    <IconArrowUp class="size-5" />
  </Button>
</template>
