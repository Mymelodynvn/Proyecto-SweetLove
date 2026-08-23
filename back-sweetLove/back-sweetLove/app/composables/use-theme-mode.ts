import { THEME_STORAGE_KEY } from '~/lib/constants'

// Dark is the default admin theme; light is opt-in via the topbar toggle.
// The html class follows this state reactively (see app.vue); initial sync
// with localStorage happens in plugins/theme.client.ts, and an inline head
// script in nuxt.config.ts applies the saved choice before first paint.
export const useThemeMode = () => {
  const isDark = useState('theme-dark', () => true)

  const toggle = () => {
    isDark.value = !isDark.value
    localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? 'dark' : 'light')
  }

  return { isDark, toggle }
}
