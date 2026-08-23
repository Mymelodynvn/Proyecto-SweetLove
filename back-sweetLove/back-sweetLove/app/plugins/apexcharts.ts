import { defineAsyncComponent } from 'vue'

// Registered on both server and client so SSR can resolve the tag; the
// browser-only bundle is loaded lazily and only ever renders inside ClientOnly.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ApexChart', defineAsyncComponent(() => import('vue3-apexcharts')))
})
