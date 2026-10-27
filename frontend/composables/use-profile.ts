// use-profile.ts — perfil de la persona administradora: el nombre y el cargo salen de la cuenta con sesión, y el resto se guarda en este navegador
export interface ProfileData {
  name: string
  role: string
  bio: string
  location: string
  // La imagen se guarda como Data URL; las iniciales son el respaldo cuando no hay fotografía.
  avatar: string | null
  instagramUrl: string
  facebookUrl: string
  whatsappUrl: string
}

// Clave de localStorage donde se guarda el perfil
const PROFILE_STORAGE_KEY = 'sweet-love-admin-profile'

// Cargo que se muestra según el rol de la cuenta, cuando la persona no escribió uno propio
const ROLE_LABELS: Record<number, string> = { 1: 'Administrador', 2: 'Cliente', 3: 'Proveedor' }

// Perfil por defecto, usado hasta que se guarde uno propio (sin nombre ni cargo: salen de la sesión)
const DEFAULT_PROFILE: ProfileData = {
  name: '',
  role: '',
  bio: 'Emprendedora venezolana radicada en Medellín, apasionada por la repostería artesanal '
    + 'y en formación constante para estar al día con las últimas tendencias. '
    + 'Su mayor placer: servir y crear momentos dulces y memorables para los demás.',
  location: 'Medellín, Colombia',
  avatar: null,
  instagramUrl: 'https://www.instagram.com/sweetlove.bymaryuri',
  facebookUrl: 'https://www.facebook.com/share/18tvevPvjz/',
  whatsappUrl: 'https://wa.me/573215771432?text=Hola%2C%20deseo%20endulzar%20un%20momento%20especial',
}

// Composable del perfil
export const useProfile = () => {
  // Lo guardado en este navegador (descripción, ubicación, avatar, redes y, si se escribió, el cargo)
  const stored = useState<ProfileData>('profile', () => ({ ...DEFAULT_PROFILE }))
  const { user } = useAuth()

  // Nombre completo de la cuenta con sesión: es el mismo que muestra la tienda al iniciar sesión
  const sessionName = computed(() => (user.value ? `${user.value.nombre} ${user.value.apellido ?? ''}`.trim() : ''))

  // Perfil que se muestra: el nombre sale siempre de la sesión y el cargo, de lo guardado o del rol de la cuenta
  const profile = computed<ProfileData>(() => ({
    ...stored.value,
    name: sessionName.value || stored.value.name,
    role: stored.value.role || (user.value ? (ROLE_LABELS[user.value.idRol] ?? '') : ''),
  }))

  // Palabras que no cuentan para las iniciales (de, del, la...)
  const NAME_CONNECTORS = new Set(['de', 'del', 'la', 'las', 'los', 'y'])

  // Iniciales del nombre (máximo dos), ignorando conectores como "de"
  const initials = computed(() =>
    profile.value.name
      .split(' ')
      .filter((part) => part.length > 0 && !NAME_CONNECTORS.has(part.toLowerCase()))
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  )

  // Nombre para saludos y la barra superior: el de la cuenta, tal cual lo muestra la tienda
  const firstName = computed(() => user.value?.nombre?.trim() || profile.value.name.split(' ')[0] || '')

  // Lee el perfil guardado y lo mezcla con el predeterminado; si está dañado, lo descarta
  const loadFromStorage = () => {
    const savedText = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!savedText) return
    try {
      const parsed: unknown = JSON.parse(savedText)
      if (parsed && typeof parsed === 'object') {
        stored.value = { ...DEFAULT_PROFILE, ...parsed }
      }
    }
    catch (parseError) {
      console.warn('El perfil almacenado está dañado; se usarán los valores predeterminados.', parseError)
      localStorage.removeItem(PROFILE_STORAGE_KEY)
    }
  }

  // Actualiza el perfil en pantalla y lo guarda en localStorage, recibe updated
  const save = (updated: ProfileData) => {
    stored.value = { ...updated }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(stored.value))
  }

  return { profile, initials, firstName, loadFromStorage, save }
}
