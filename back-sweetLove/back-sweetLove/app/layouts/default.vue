<script setup lang="ts">
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'

const { loadFromStorage } = useProfile()

onMounted(loadFromStorage)
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AppTopbar />
      <main class="flex-1 p-4 md:p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
