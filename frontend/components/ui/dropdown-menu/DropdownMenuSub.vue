<!--
  Archivo del proyecto Sweet Love.
  Propósito: contiene la interfaz o lógica descrita por su nombre y ubicación.
  Los comentarios internos explican la responsabilidad de los bloques principales.
-->
<script setup lang="ts">
import type { DropdownMenuSubEmits, DropdownMenuSubProps } from 'reka-ui'
import {
  DropdownMenuSub,
  useForwardPropsEmits,
} from 'reka-ui'

const props = defineProps<DropdownMenuSubProps>()
const emits = defineEmits<DropdownMenuSubEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuSub v-slot="slotProps" data-slot="dropdown-menu-sub" v-bind="forwarded">
    <slot v-bind="slotProps" />
  </DropdownMenuSub>
</template>
