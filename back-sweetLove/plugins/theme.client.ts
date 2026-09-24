/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
import { THEME_STORAGE_KEY } from '~/lib/constants'

// Sincroniza el estado reactivo del tema con la opción guardada antes de montar la aplicación.
export default defineNuxtPlugin(() => {
  const isDark = useState('theme-dark', () => true)
  isDark.value = localStorage.getItem(THEME_STORAGE_KEY) !== 'light'
})
