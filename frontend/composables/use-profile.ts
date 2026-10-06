/**
 * use-profile.ts — perfil de la persona administradora.
 * El perfil se guarda en localStorage (no existe tabla de perfil en la base de datos).
 */
export interface ProfileData {
  name: string
  role: string
  bio: string
  location: string
  // La imagen se guarda como Data URL; las iniciales son el respaldo cuando no hay fotografía.
  avatar: string | null
  instagramUrl: string
  facebookUrl: string
}

/** Clave de localStorage donde se guarda el perfil. */
const PROFILE_STORAGE_KEY = 'sweet-love-admin-profile'

/** Perfil por defecto, usado hasta que se guarde uno propio. */
const DEFAULT_PROFILE: ProfileData = {
  name: 'Maryuri de Mendoza',
  role: 'CEO & Fundadora',
  bio: 'Emprendedora venezolana radicada en Medellín, apasionada por la repostería artesanal '
    + 'y en formación constante para estar al día con las últimas tendencias. '
    + 'Su mayor placer: servir y crear momentos dulces y memorables para los demás.',
  location: 'Medellín, Colombia',
  avatar: null,
  instagramUrl: 'https://www.instagram.com/sweetlove',
  facebookUrl: 'https://www.facebook.com/sweetlove',
}

/**
 * Composable del perfil.
 * @returns Estado `profile`, iniciales, primer nombre y las funciones loadFromStorage y save.
 */
export const useProfile = () => {
  const profile = useState<ProfileData>('profile', () => ({ ...DEFAULT_PROFILE }))

  /** Palabras que no cuentan para las iniciales (de, del, la...). */
  const NAME_CONNECTORS = new Set(['de', 'del', 'la', 'las', 'los', 'y'])

  /** Iniciales del nombre (máximo dos), ignorando conectores como "de". */
  const initials = computed(() =>
    profile.value.name
      .split(' ')
      .filter((part) => part.length > 0 && !NAME_CONNECTORS.has(part.toLowerCase()))
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  )

  /** Primer nombre, para saludos y la barra superior. */
  const firstName = computed(() => profile.value.name.split(' ')[0] ?? '')

  /** Lee el perfil guardado y lo mezcla con el predeterminado; si está dañado, lo descarta. */
  const loadFromStorage = () => {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!stored) return
    try {
      const parsed: unknown = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') {
        profile.value = { ...DEFAULT_PROFILE, ...parsed }
      }
    }
    catch (parseError) {
      console.warn('El perfil almacenado está dañado; se usarán los valores predeterminados.', parseError)
      localStorage.removeItem(PROFILE_STORAGE_KEY)
    }
  }

  /**
   * Actualiza el perfil en pantalla y lo guarda en localStorage.
   * @param {ProfileData} updated Perfil completo con los cambios.
   */
  const save = (updated: ProfileData) => {
    profile.value = { ...updated }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile.value))
  }

  return { profile, initials, firstName, loadFromStorage, save }
}
