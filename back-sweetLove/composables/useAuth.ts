/**
 * @file composables/useAuth.ts
 * @description Composable global para gestionar la sesión del usuario y la navegación por roles.
 * 
 * @project Sweet Love E-Commerce
 * @module Composables
 */

export interface UserSession {
    id: number
    nombre: string
    email: string
    idRol: number
}

export const useAuth = () => {
    const user = useState<UserSession | null>('auth_user', () => null)

    const setUser = (userData: UserSession | null) => {
        user.value = userData
    }

    const logout = () => {
        user.value = null
        navigateTo('/')
    }

    return {
        user,
        setUser,
        logout,
        isAdmin: computed(() => user.value?.idRol === 1),
        isLoggedIn: computed(() => user.value !== null)
    }
}