import { THEME_STORAGE_KEY } from '~/lib/constants'

// Sync the reactive theme state with the saved choice before the app mounts.
export default defineNuxtPlugin(() => {
  const isDark = useState('theme-dark', () => true)
  isDark.value = localStorage.getItem(THEME_STORAGE_KEY) !== 'light'
})
