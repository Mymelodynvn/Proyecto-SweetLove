// Composable global para gestionar la sesión del usuario y la navegación por roles

// Usuario con sesión iniciada, tal como lo devuelve el backend (sin contraseña)
export interface UserSession {
    idUser: number
    nombre: string
    apellido?: string
    email: string
    idRol: number
}

// Composable de autenticación: estado del usuario actual y acciones de sesión
export const useAuth = () => {
    const user = useState<UserSession | null>('auth_user', () => null)

    // Guarda el usuario autenticado en el estado global (o lo limpia con null), recibe userData
    const setUser = (userData: UserSession | null) => {
        user.value = userData
    }

    // Sincroniza el usuario con la sesión del servidor (también durante el SSR)
    const loadUser = async () => {
        try {
            const response = await useRequestFetch()<{ user: UserSession | null }>('/api/auth/me')
            user.value = response.user
        } catch {
            user.value = null
        }
    }

    // Cierra la sesión en el servidor, limpia el usuario y lleva a la pantalla de acceso
    const logout = async () => {
        try {
            await $fetch('/api/auth/logout', { method: 'POST' })
        } finally {
            user.value = null
            await navigateTo('/auth/sign-in')
        }
    }

    return {
        user,
        setUser,
        loadUser,
        logout,
        isAdmin: computed(() => user.value?.idRol === 1),
        isLoggedIn: computed(() => user.value !== null)
    }
}
