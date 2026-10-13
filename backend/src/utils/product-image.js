// Manejo de las imágenes de productos que sube el administrador
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HttpError } from './httpError.js'

// Carpeta física donde se almacenan las imágenes (backend/uploads/products)
export const UPLOADS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'uploads')

// Tamaño máximo permitido por imagen (3 MB una vez decodificada)
const MAX_IMAGE_BYTES = 3 * 1024 * 1024

// Indica si el texto recibido es una imagen en formato Data URL, recibe value
export const isImageDataUrl = (value) => typeof value === 'string' && value.startsWith('data:image/')

// Guarda una imagen Data URL como archivo y devuelve su ruta pública, recibe dataUrl, productId
export const saveProductImage = async (dataUrl, productId) => {
  const match = dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/)
  if (!match) throw new HttpError(400, 'Formato de imagen no compatible (usa PNG, JPG o WEBP).')

  const [, format, base64] = match
  const buffer = Buffer.from(base64, 'base64')
  if (buffer.length > MAX_IMAGE_BYTES) throw new HttpError(400, 'La imagen supera el máximo de 3 MB.')

  const extension = format === 'jpeg' ? 'jpg' : format
  const directory = join(UPLOADS_ROOT, 'products')
  await mkdir(directory, { recursive: true })

  const fileName = `producto-${productId}-${Date.now()}.${extension}`
  await writeFile(join(directory, fileName), buffer)
  return `/uploads/products/${fileName}`
}

// Largo máximo de la ruta o URL de la imagen (columna producto.imagen)
const MAX_IMAGE_REFERENCE_LENGTH = 255

// Valida la imagen de un producto: vacía, archivo en Data URL (se guarda aparte), ruta propia ("/...") o URL http(s); devuelve el texto limpio o null, recibe value
export const parseImageReference = (value) => {
  if (value == null || value === '') return null
  if (typeof value !== 'string') throw new HttpError(400, 'La imagen no es válida.')

  const text = value.trim()
  if (!text) return null
  if (isImageDataUrl(text)) return text

  if (text.length > MAX_IMAGE_REFERENCE_LENGTH) {
    throw new HttpError(400, `La dirección de la imagen admite máximo ${MAX_IMAGE_REFERENCE_LENGTH} caracteres.`)
  }
  // Ruta de un archivo del propio sitio (por ejemplo /uploads/products/... o /tienda/assets/...); sin "//" ni ".."
  const isOwnPath = text.startsWith('/') && !text.startsWith('//') && !text.includes('..') && !/\s/.test(text)
  // URL externa con http o https y sin espacios
  const isWebUrl = /^https?:\/\/[^\s/$.?#][^\s]*$/i.test(text)
  if (!isOwnPath && !isWebUrl) {
    throw new HttpError(400, 'La imagen debe ser un archivo subido o una URL que empiece con http:// o https://.')
  }
  return text
}
