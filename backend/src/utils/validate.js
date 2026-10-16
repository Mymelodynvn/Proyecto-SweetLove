// Funciones pequeñas de validación y conversión de datos de entrada
import { HttpError } from './httpError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Largo de la columna usuario.email (ver database/schema.sql)
const MAX_EMAIL_LENGTH = 100

// Convierte un valor en texto sin espacios sobrantes, recibe value
export const cleanText = (value) => String(value ?? '').trim()

// Valida y normaliza un correo electrónico (minúsculas); no admite espacios, ni siquiera al inicio o al final, recibe value
export const parseEmail = (value) => {
  const text = String(value ?? '')
  if (/\s/.test(text)) throw new HttpError(400, 'El correo no puede tener espacios.')
  const email = text.toLowerCase()
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'El correo electrónico no es válido.')
  if (email.length > MAX_EMAIL_LENGTH) throw new HttpError(400, `El correo admite máximo ${MAX_EMAIL_LENGTH} caracteres.`)
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

// Máximos de un pedido: productos distintos y unidades por producto (frenan pedidos abusivos antes de tocar la base)
export const MAX_ORDER_LINES = 30
export const MAX_LINE_QUANTITY = 50

// Valida las líneas de un pedido y suma las que repiten el mismo producto; devuelve [{ productId, quantity }], recibe items
export const parseOrderItems = (items) => {
  if (!Array.isArray(items) || !items.length) throw new HttpError(400, 'El pedido debe contener al menos un producto.')
  if (items.length > MAX_ORDER_LINES) throw new HttpError(400, `Un pedido admite máximo ${MAX_ORDER_LINES} productos.`)

  const byProduct = new Map()
  for (const item of items) {
    const productId = Number(item?.productId)
    const quantity = Number(item?.quantity)
    if (!Number.isInteger(productId) || productId < 1 || !Number.isInteger(quantity) || quantity < 1) {
      throw new HttpError(400, 'Uno de los productos del pedido no es válido.')
    }
    byProduct.set(productId, (byProduct.get(productId) ?? 0) + quantity)
  }

  for (const quantity of byProduct.values()) {
    if (quantity > MAX_LINE_QUANTITY) throw new HttpError(400, `Puedes pedir máximo ${MAX_LINE_QUANTITY} unidades de cada producto.`)
  }
  return [...byProduct].map(([productId, quantity]) => ({ productId, quantity }))
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
