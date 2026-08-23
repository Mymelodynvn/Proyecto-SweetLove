<script setup lang="ts">
import { IconPhotoUp, IconX } from '@tabler/icons-vue'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'

const props = defineProps<{
  modelValue: string | null
  fallbackText: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploadError = ref('')

const handleFileSelection = async (changeEvent: Event) => {
  uploadError.value = ''
  const input = changeEvent.target

  if (!(input instanceof HTMLInputElement) || !input.files?.[0]) return

  try {
    emit('update:modelValue', await readImageAsDataUrl(input.files[0]))
  }
  catch (readError) {
    uploadError.value = 'No se pudo leer la imagen. Intenta con otro archivo.'
    console.warn('Avatar image could not be processed.', readError)
  }
  finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="flex items-center gap-3">
    <Avatar class="size-16">
      <AvatarImage v-if="props.modelValue" :src="props.modelValue" alt="Avatar" />

      <AvatarFallback class="bg-primary text-primary-foreground font-semibold">
        {{ props.fallbackText }}
      </AvatarFallback>
    </Avatar>

    <div class="flex flex-col items-start gap-1.5">
      <div class="flex gap-2">
        <Button type="button" variant="outline" size="sm" @click="fileInput?.click()">
          <IconPhotoUp class="size-4" />
          {{ props.modelValue ? 'Cambiar foto' : 'Subir foto' }}
        </Button>

        <Button v-if="props.modelValue" type="button" variant="ghost" size="sm" @click="emit('update:modelValue', null)">
          <IconX class="size-4" />
          Quitar
        </Button>
      </div>

      <p class="text-muted-foreground text-xs">Si no subes una foto se mostrarán las iniciales.</p>

      <p v-if="uploadError" class="text-destructive text-xs">{{ uploadError }}</p>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileSelection"
    >
  </div>
</template>
