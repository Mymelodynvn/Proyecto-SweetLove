// Archivo principal de configuración global del frontend (Nuxt 4)

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // Configuración del servidor de desarrollo local
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Conexión con el backend (proyecto /backend, Express)
  routeRules: {
    // La portada del sitio es la tienda; el panel de administración vive en /admin.
    '/': { redirect: '/tienda/index.html' },
    '/api/**': { proxy: `${process.env.API_URL || 'http://localhost:4000'}/api/**` },
    '/uploads/**': { proxy: `${process.env.API_URL || 'http://localhost:4000'}/uploads/**` },
  },

  // Configuración de la cabecera HTML (<head>)
  app: {
    head: {
      script: [
        {
          innerHTML: `try{if(localStorage.getItem('sweet-love-admin-theme')==='light')document.documentElement.classList.remove('dark')}catch(storageError){}`,
        },
      ],
    },
  },

  // Módulos adicionales de Nuxt registrados en el sistema
  modules: ['shadcn-nuxt'],

  // Hojas de estilos CSS registradas globalmente
  css: [
    '~/assets/css/tailwind.css'
  ],

  // Configuración del compilador Vite y sus plugins
  vite: {
    plugins: [tailwindcss()],
  },

  // Configuración de la librería de componentes Shadcn UI
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },
})