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

// Valida un celular: entre 7 y 15 números (se aceptan espacios, guiones, paréntesis y un + inicial) y devuelve el texto limpio, recibe value
export const parsePhone = (value) => {
  const phone = cleanText(value)
  const digits = phone.replace(/\D/g, '')
  if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15 || phone.length > 20) {
    throw new HttpError(400, 'El celular no es válido (entre 7 y 15 números).')
  }
  return phone
}

// Valida una dirección de entrega: entre 6 y 150 caracteres, recibe value
export const parseAddress = (value) => {
  const address = cleanText(value)
  if (address.length < 6 || address.length > 150) throw new HttpError(400, 'La dirección de entrega debe tener entre 6 y 150 caracteres.')
  return address
}

// Valida un nombre de persona (obligatorio o no) con un máximo de caracteres, recibe value, label, maxLength, required
export const parseName = (value, label, maxLength = 50, required = true) => {
  const name = cleanText(value)
  if (!name && !required) return ''
  if (name.length < 2 || name.length > maxLength) {
    throw new HttpError(400, `${label} debe tener entre 2 y ${maxLength} caracteres.`)
  }
  return name
}
