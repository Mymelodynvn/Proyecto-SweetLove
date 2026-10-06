// apexcharts.ts — registra el componente de gráficas ApexChart
import { defineAsyncComponent } from 'vue'

// Se registra en servidor y cliente para que SSR pueda resolver la etiqueta; el
// paquete exclusivo del navegador se carga de forma diferida y solo se renderiza dentro de ClientOnly.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ApexChart', defineAsyncComponent(() => import('vue3-apexcharts')))
})
