<!--
  Archivo del proyecto Sweet Love.
  Propósito: contiene la interfaz o lógica descrita por su nombre y ubicación.
  Los comentarios internos explican la responsabilidad de los bloques principales.
-->
<script setup lang="ts">
import type { DropdownMenuRadioGroupEmits, DropdownMenuRadioGroupProps } from 'reka-ui'
import {
  DropdownMenuRadioGroup,
  useForwardPropsEmits,
} from 'reka-ui'

const props = defineProps<DropdownMenuRadioGroupProps>()
const emits = defineEmits<DropdownMenuRadioGroupEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuRadioGroup
    data-slot="dropdown-menu-radio-group"
    v-bind="forwarded"
  >
    <slot />
  </DropdownMenuRadioGroup>
</template>
