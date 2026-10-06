// Funciones pequeñas de validación y conversión de datos de entrada
import { HttpError } from './httpError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Convierte un valor en texto sin espacios sobrantes, recibe value
export const cleanText = (value) => String(value ?? '').trim()

// Valida y normaliza un correo electrónico (minúsculas), recibe value
export const parseEmail = (value) => {
  const email = cleanText(value).toLowerCase()
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'El correo electrónico no es válido.')
  return email
}

// Convierte un valor en entero positivo (>= 1), p. ej. un identificador, recibe value, label
export const parsePositiveInt = (value, label = 'El identificador') => {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 1) throw new HttpError(400, `${label} no es válido.`)
  return number
}

// Convierte un valor en entero mayor o igual a cero (precio, stock), recibe value, label
export const parseNonNegativeInt = (value, label) => {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 0) throw new HttpError(400, `${label} debe ser un número entero mayor o igual a 0.`)
  return number
}
