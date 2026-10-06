/**
 * Funciones pequeñas de validación y conversión de datos de entrada.
 * Todas lanzan HttpError 400 si el dato no es válido, así los controladores
 * quedan cortos y los mensajes de error son consistentes.
 */
import { HttpError } from './httpError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Convierte un valor en texto sin espacios sobrantes.
 * @param {unknown} value Valor recibido (puede ser undefined o de otro tipo).
 * @returns {string} Texto recortado; cadena vacía si el valor es nulo.
 */
export const cleanText = (value) => String(value ?? '').trim()

/**
 * Valida y normaliza un correo electrónico (minúsculas).
 * @param {unknown} value Correo recibido.
 * @returns {string} Correo normalizado.
 */
export const parseEmail = (value) => {
  const email = cleanText(value).toLowerCase()
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'El correo electrónico no es válido.')
  return email
}

/**
 * Convierte un valor en entero positivo (>= 1), p. ej. un identificador.
 * @param {unknown} value Valor recibido (texto o número).
 * @param {string} label Nombre del campo para el mensaje de error.
 * @returns {number} Entero positivo.
 */
export const parsePositiveInt = (value, label = 'El identificador') => {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 1) throw new HttpError(400, `${label} no es válido.`)
  return number
}

/**
 * Convierte un valor en entero mayor o igual a cero (precio, stock).
 * @param {unknown} value Valor recibido.
 * @param {string} label Nombre del campo para el mensaje de error.
 * @returns {number} Entero no negativo.
 */
export const parseNonNegativeInt = (value, label) => {
  const number = Number(value)
  if (!Number.isInteger(number) || number < 0) throw new HttpError(400, `${label} debe ser un número entero mayor o igual a 0.`)
  return number
}
