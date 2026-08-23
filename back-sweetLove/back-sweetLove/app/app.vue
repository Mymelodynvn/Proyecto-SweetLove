<script setup lang="ts">
const { isDark } = useThemeMode()

useHead({
  htmlAttrs: { class: computed(() => (isDark.value ? 'dark' : '')) },
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
