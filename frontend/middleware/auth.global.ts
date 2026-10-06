/**
 * @file middleware/auth.global.ts
 * @description Guardia global de rutas del panel. Corre antes de cada navegación:
 * consulta la sesión real del servidor (/api/auth/me) y, si no hay un
 * Administrador autenticado, redirige al inicio de sesión. Solo /auth/* y /error/*
 * son públicas. Es una comodidad de la interfaz; la seguridad real está en el
 * backend, que rechaza con 401/403 cualquier petición sin permisos.
 */
const PUBLIC_PREFIXES = ['/auth', '/error']
/** Identificador del rol Administrador en la base de datos. */
const ADMIN_ROLE_ID = 1

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PREFIXES.some((prefix) => to.path.startsWith(prefix))) return

  const { user, loadUser } = useAuth()
  await loadUser()

  if (!user.value || user.value.idRol !== ADMIN_ROLE_ID) {
    return navigateTo('/auth/sign-in')
  }
})
