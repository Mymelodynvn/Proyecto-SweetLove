export interface ProfileData {
  name: string
  role: string
  bio: string
  location: string
  // Downscaled data URL; initials are the fallback when no photo is set.
  avatar: string | null
  instagramUrl: string
  facebookUrl: string
}

const PROFILE_STORAGE_KEY = 'sweet-love-admin-profile'

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

export const useProfile = () => {
  const profile = useState<ProfileData>('profile', () => ({ ...DEFAULT_PROFILE }))

  const NAME_CONNECTORS = new Set(['de', 'del', 'la', 'las', 'los', 'y'])

  const initials = computed(() =>
    profile.value.name
      .split(' ')
      .filter((part) => part.length > 0 && !NAME_CONNECTORS.has(part.toLowerCase()))
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  )

  const firstName = computed(() => profile.value.name.split(' ')[0] ?? '')

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
      console.warn('Stored profile is corrupt, falling back to defaults.', parseError)
      localStorage.removeItem(PROFILE_STORAGE_KEY)
    }
  }

  const save = (updated: ProfileData) => {
    profile.value = { ...updated }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile.value))
  }

  return { profile, initials, firstName, loadFromStorage, save }
}
