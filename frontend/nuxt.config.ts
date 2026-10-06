/**
 * @file nuxt.config.ts
 * @description Archivo principal de configuración global del frontend (Nuxt 4).
 * Define el servidor de desarrollo, el proxy hacia la API del backend,
 * la precarga del tema visual,
 * los módulos de UI (Shadcn) y la carga exclusiva de Tailwind CSS para no romper la interfaz del Panel.
 *
 * @project Sweet Love E-Commerce
 * @module Config
 */

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  /**
   * Configuración del servidor de desarrollo local.
   * Enlaza la aplicación a todas las interfaces IPv4 (0.0.0.0) en el puerto 3000.
   */
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  /**
   * Conexión con el backend (proyecto /backend, Express).
   * El navegador siempre habla con este mismo origen: Nuxt reenvía /api y /uploads
   * al backend. Así la cookie de sesión es de mismo origen (sin CORS ni cookies
   * de terceros). API_URL se lee al construir (build) la aplicación.
   */
  routeRules: {
    // La portada del sitio es la tienda; el panel de administración vive en /admin.
    '/': { redirect: '/tienda/index.html' },
    '/api/**': { proxy: `${process.env.API_URL || 'http://localhost:4000'}/api/**` },
    '/uploads/**': { proxy: `${process.env.API_URL || 'http://localhost:4000'}/uploads/**` },
  },

  /**
   * Configuración de la cabecera HTML (<head>).
   * Ejecuta un script síncrono previo al renderizado para aplicar el tema guardado
   * en localStorage y evitar parpadeos de color durante la carga inicial.
   */
  app: {
    head: {
      script: [
        {
          innerHTML: `try{if(localStorage.getItem('sweet-love-admin-theme')==='light')document.documentElement.classList.remove('dark')}catch(storageError){}`,
        },
      ],
    },
  },

  /**
   * Módulos adicionales de Nuxt registrados en el sistema.
   */
  modules: ['shadcn-nuxt'],

  /**
   * Hojas de estilos CSS registradas globalmente.
   * Se conserva únicamente Tailwind CSS para garantizar la integridad visual del Dashboard Shadcn.
   */
  css: [
    '~/assets/css/tailwind.css'
  ],

  /**
   * Configuración del compilador Vite y sus plugins.
   */
  vite: {
    plugins: [tailwindcss()],
  },

  /**
   * Configuración de la librería de componentes Shadcn UI.
   */
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },
})