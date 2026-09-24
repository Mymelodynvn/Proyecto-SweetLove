/**
 * @file nuxt.config.ts
 * @description Archivo principal de configuración global del framework Nuxt 3.
 * Define la configuración del servidor de desarrollo, las reglas de enrutamiento y CORS,
 * la precarga del tema visual, variables de entorno de la base de datos MySQL,
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
   * Reglas de enrutamiento y políticas CORS para solicitudes API.
   * Permite la comunicación segura y el intercambio de recursos para los endpoints bajo /api/**.
   */
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    }
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
   * Variables de entorno para el entorno de ejecución en el servidor.
   * Define los parámetros de conexión predeterminados hacia la base de datos MySQL.
   */
  runtimeConfig: {
    databaseHost: process.env.DATABASE_HOST || 'localhost',
    databasePort: Number(process.env.DATABASE_PORT || 3306),
    databaseUser: process.env.DATABASE_USER || 'root',
    databasePassword: process.env.DATABASE_PASSWORD || '',
    databaseName: process.env.DATABASE_NAME || 'sweetlove',
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