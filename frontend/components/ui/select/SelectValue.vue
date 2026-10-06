<!--
  Archivo del proyecto Sweet Love.
  Propósito: contiene la interfaz o lógica descrita por su nombre y ubicación.
  Los comentarios internos explican la responsabilidad de los bloques principales.
-->
<script setup lang="ts">
import type { SelectValueProps } from 'reka-ui'
import { SelectValue } from 'reka-ui'

const props = defineProps<SelectValueProps>()
</script>

<template>
  <SelectValue
    data-slot="select-value"
    v-bind="props"
  >
    <slot />
  </SelectValue>
</template>
