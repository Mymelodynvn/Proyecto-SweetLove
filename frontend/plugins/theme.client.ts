// theme.client.ts — aplica el tema guardado al iniciar el navegador (solo cliente)
import { THEME_STORAGE_KEY } from '~/lib/constants'

// Sincroniza el estado reactivo del tema con la opción guardada antes de montar la aplicación.
export default defineNuxtPlugin(() => {
  const isDark = useState('theme-dark', () => true)
  isDark.value = localStorage.getItem(THEME_STORAGE_KEY) !== 'light'
})
