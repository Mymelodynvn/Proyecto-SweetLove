/**
 * @file composables/useAuth.ts
 * @description Composable global para gestionar la sesión del usuario y la navegación por roles.
 * La sesión real vive en una cookie httpOnly del servidor; aquí solo se refleja
 * el usuario autenticado para la interfaz.
 *
 * @project Sweet Love E-Commerce
 * @module Composables
 */

export interface UserSession {
    idUser: number
    nombre: string
    apellido?: string
    email: string
    idRol: number
}

export const useAuth = () => {
    const user = useState<UserSession | null>('auth_user', () => null)

    const setUser = (userData: UserSession | null) => {
        user.value = userData
    }

    /** Sincroniza el usuario con la sesión del servidor (también durante el SSR). */
    const loadUser = async () => {
        try {
            const response = await useRequestFetch()<{ user: UserSession | null }>('/api/auth/me')
            user.value = response.user
        } catch {
            user.value = null
        }
    }

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
