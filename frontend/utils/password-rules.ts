// password-rules.ts — reglas de contraseña del panel (el servidor las vuelve a comprobar)

// Reglas que se muestran en los formularios
export const PASSWORD_RULES_TEXT = 'Mínimo 8 caracteres, con al menos una letra y un número.'

// Devuelve el problema de una contraseña (texto) o una cadena vacía si cumple las reglas básicas, recibe password
export const passwordProblem = (password: string): string => {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (new TextEncoder().encode(password).length > 72) return 'La contraseña es demasiado larga (máximo 72 caracteres).'
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return 'La contraseña debe tener al menos una letra y un número.'
  return ''
}

// Extrae el mensaje de error que envía la API (o uno por defecto), recibe error, fallback
export const apiErrorMessage = (error: unknown, fallback: string): string =>
  (error as { data?: { statusMessage?: string } })?.data?.statusMessage || fallback
