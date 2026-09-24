/**
 * @file middleware/admin.ts
 * @description Protege las rutas administrativas. Redirige a la portada
 * si no hay usuario autenticado o si no tiene rol de Administrador (idRol !== 1).
 */
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()

  if (!user.value || user.value.idRol !== 1) {
    return navigateTo('/')
  }
})