<script setup lang="ts">
import { IconCake } from '@tabler/icons-vue'
</script>

<template>
  <div class="from-secondary via-background to-background flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b p-4">
    <NuxtLink to="/" class="flex items-center gap-2">
      <span class="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full">
        <IconCake class="size-6" />
      </span>
      <span class="font-heading text-2xl font-bold">Sweet Love</span>
    </NuxtLink>
    <slot />
  </div>
</template>
