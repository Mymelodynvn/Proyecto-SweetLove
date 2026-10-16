// Reglas de contraseña: sin espacios ni símbolos, largo, letras y números, claves obvias y datos de la propia cuenta
import { HttpError } from './httpError.js'

// Largo mínimo y máximo en caracteres (con solo letras y números, 16 caracteres caben de sobra en los 72 bytes que lee bcrypt)
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 16

// Claves muy usadas que no se aceptan (se comparan en minúsculas)
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'contrasena', 'contrasena1', 'contrasena123', 'contraseña', 'contraseña1',
  '12345678', '123456789', '1234567890', '12341234', '123123123', '87654321', '11111111', '00000000', '1q2w3e4r',
  'qwertyui', 'qwerty123', 'qwertyuiop', 'asdfghjk', 'asdfghjkl', 'zxcvbnm1', 'abcd1234', 'abc12345', 'a1b2c3d4',
  'iloveyou', 'iloveyou1', 'welcome1', 'letmein1', 'admin123', 'administrador', 'sweetlove', 'sweetlove1',
  'sweetlove123', 'colombia', 'colombia1', 'medellin', 'medellin1', 'bogota123', 'football', 'baseball', 'superman',
  'monkey123', 'dragon123', 'master123', 'princesa', 'princesa1', 'te amo123', 'teamo123', 'mariposa', 'chocolate',
  'chocolate1',
])

// Indica si todos los caracteres son iguales (aaaaaaaa), recibe text
const isRepeated = (text) => new Set(text).size === 1

// Indica si es una secuencia seguida (12345678, abcdefgh, 87654321), recibe text
const isSequence = (text) => {
  const codes = [...text.toLowerCase()].map((char) => char.charCodeAt(0))
  const step = codes[1] - codes[0]
  return Math.abs(step) === 1 && codes.every((code, index) => index === 0 || code - codes[index - 1] === step)
}

// Devuelve el primer problema de la contraseña (texto en español) o una cadena vacía si es válida, recibe password y el contexto { email, name }
export const passwordProblem = (password, { email = '', name = '' } = {}) => {
  if (typeof password !== 'string') return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
  if (/\s/.test(password)) return 'La contraseña no puede tener espacios.'
  // Solo letras (con tildes y ñ) y números: los símbolos, como < > # . -, no se aceptan
  if (/[^\p{L}\d]/u.test(password)) return 'La contraseña solo puede tener letras y números (sin símbolos como < > # . -).'
  if (password.length < PASSWORD_MIN_LENGTH) return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
  if (password.length > PASSWORD_MAX_LENGTH) return `La contraseña admite máximo ${PASSWORD_MAX_LENGTH} caracteres.`
  if (isRepeated(password) || isSequence(password) || COMMON_PASSWORDS.has(password.toLowerCase())) {
    return 'Esa contraseña es demasiado común. Elige una más difícil de adivinar.'
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return 'La contraseña debe tener al menos una letra y un número.'

  const lower = password.toLowerCase()
  const emailName = String(email).split('@')[0].toLowerCase()
  if (emailName.length >= 4 && lower.includes(emailName)) return 'La contraseña no debe contener tu correo.'
  const firstName = String(name).trim().split(/\s+/)[0].toLowerCase()
  if (firstName.length >= 4 && lower === firstName) return 'La contraseña no debe ser tu nombre.'
  return ''
}

// Lanza un error 400 si la contraseña no cumple las reglas, recibe password y el contexto { email, name }
export const assertStrongPassword = (password, context) => {
  const problem = passwordProblem(password, context)
  if (problem) throw new HttpError(400, problem, 'WEAK_PASSWORD')
}
