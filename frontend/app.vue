<!--
  @file app.vue
  @description Componente raíz de la aplicación Nuxt 3 (Sweet Love).
  Mantiene el wrapper global de vistas (<NuxtPage />), la inyección de layouts (<NuxtLayout />)
  y la reactividad del modo oscuro (Dark Mode) para componentes Shadcn UI y Tailwind CSS.

  @project Sweet Love E-Commerce
  @module Root
-->
<script setup lang="ts">
import { computed } from 'vue'

/**
 * Obtención del estado del tema visual (Light/Dark).
 */
const { isDark } = useThemeMode()

/**
 * Asignación dinámica de la clase 'dark' en la etiqueta <html> del DOM
 * para activar los estilos oscuros en el Panel de Administración.
 */
useHead({
  htmlAttrs: {
    class: computed(() => (isDark.value ? 'dark' : ''))
  }
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>