// Guardia global de rutas del panel
// Rutas que se pueden abrir sin iniciar sesión (acceso y pantallas de error)
const PUBLIC_PREFIXES = ['/auth', '/error']
// Identificador del rol Administrador en la base de datos
const ADMIN_ROLE_ID = 1

// Antes de cada navegación: exige un administrador con sesión o redirige a /auth/sign-in, recibe to
export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PREFIXES.some((prefix) => to.path.startsWith(prefix))) return

  const { user, loadUser } = useAuth()
  await loadUser()

  if (!user.value || user.value.idRol !== ADMIN_ROLE_ID) {
    return navigateTo('/auth/sign-in')
  }
})
