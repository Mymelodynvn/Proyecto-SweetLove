import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      // Applies the saved theme before first paint so reloads never flash the
      // wrong theme; the reactive class itself is managed from app.vue.
      script: [
        {
          innerHTML: `try{if(localStorage.getItem('sweet-love-admin-theme')==='light')document.documentElement.classList.remove('dark')}catch(storageError){}`,
        },
      ],
    },
  },
  modules: ['shadcn-nuxt'],
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },
})
