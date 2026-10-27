// password-rules.ts — reglas de contraseña del panel (el servidor las vuelve a comprobar)

// Reglas que se muestran en los formularios
export const PASSWORD_RULES_TEXT = 'De 8 a 16 caracteres, sin espacios ni los caracteres < o >, con al menos una letra, un número y un carácter especial (@, #, $, !, ?, * o .).'

// Devuelve el problema de un correo (texto) o una cadena vacía si es válido: sin espacios y con forma de correo, recibe email
export const emailProblem = (email: string): string => {
  if (/\s/.test(email)) return 'El correo no puede tener espacios.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Escribe un correo válido, por ejemplo tucorreo@ejemplo.com.'
  if (email.length > 100) return 'El correo admite máximo 100 caracteres.'
  return ''
}

// Devuelve el problema de una contraseña (texto) o una cadena vacía si cumple las reglas básicas, recibe password
export const passwordProblem = (password: string): string => {
  if (/\s/.test(password)) return 'La contraseña no puede tener espacios.'
  if (/[<>]/.test(password)) return 'La contraseña no puede tener los caracteres < ni >.'
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
  if (password.length > 16) return 'La contraseña admite máximo 16 caracteres.'
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return 'La contraseña debe tener al menos una letra y un número.'
  if (!/[@#$!?*.]/.test(password)) return 'La contraseña debe tener al menos un carácter especial (@, #, $, !, ?, * o .).'
  return ''
}

// Extrae el mensaje de error que envía la API (o uno por defecto), recibe error, fallback
export const apiErrorMessage = (error: unknown, fallback: string): string =>
  (error as { data?: { statusMessage?: string } })?.data?.statusMessage || fallback
