<!--
  Archivo del proyecto Sweet Love.
  Propósito: contiene la interfaz o lógica descrita por su nombre y ubicación.
  Los comentarios internos explican la responsabilidad de los bloques principales.
-->
<script setup lang="ts">
import { IconMoon, IconSun } from '@tabler/icons-vue'
import { Button } from '~/components/ui/button'

const { isDark, toggle } = useThemeMode()
</script>

<template>
  <Button variant="ghost" size="icon" aria-label="Cambiar tema" @click="toggle">
    <IconMoon v-if="!isDark" class="size-5" />
    <IconSun v-else class="size-5" />
  </Button>
</template>
