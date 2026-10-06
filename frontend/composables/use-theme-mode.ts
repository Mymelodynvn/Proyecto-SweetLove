// use-theme-mode.ts — tema claro/oscuro del panel
import { THEME_STORAGE_KEY } from '~/lib/constants'

// El tema oscuro es el predeterminado del administrador y el tema claro se activa desde la barra superior.
// La clase HTML sigue este estado de forma reactiva; la sincronización inicial
// con localStorage ocurre en el plugin del tema y el script inicial del encabezado
// el script inicial de nuxt.config.ts aplica la elección guardada antes del primer renderizado.
// Composable del tema
export const useThemeMode = () => {
  const isDark = useState('theme-dark', () => true)

  // Alterna entre tema claro y oscuro y guarda la elección
  const toggle = () => {
    isDark.value = !isDark.value
    localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? 'dark' : 'light')
  }

  return { isDark, toggle }
}
