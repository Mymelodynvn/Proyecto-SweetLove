/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
import { defineAsyncComponent } from 'vue'

// Se registra en servidor y cliente para que SSR pueda resolver la etiqueta; el
// paquete exclusivo del navegador se carga de forma diferida y solo se renderiza dentro de ClientOnly.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ApexChart', defineAsyncComponent(() => import('vue3-apexcharts')))
})
