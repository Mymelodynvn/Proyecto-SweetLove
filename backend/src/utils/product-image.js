/**
 * Manejo de las imágenes de productos que sube el administrador.
 * El navegador envía la imagen como Data URL (base64); aquí se guarda como
 * archivo en `uploads/products` y se devuelve la ruta pública para guardarla en MySQL.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HttpError } from './httpError.js'

/** Carpeta física donde se almacenan las imágenes (backend/uploads/products). */
export const UPLOADS_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'uploads')

/** Tamaño máximo permitido por imagen (3 MB una vez decodificada). */
const MAX_IMAGE_BYTES = 3 * 1024 * 1024

/**
 * Indica si el texto recibido es una imagen en formato Data URL.
 * @param {unknown} value Valor a revisar.
 * @returns {boolean} true si empieza con "data:image/".
 */
export const isImageDataUrl = (value) => typeof value === 'string' && value.startsWith('data:image/')

/**
 * Guarda una imagen Data URL como archivo y devuelve su ruta pública.
 * @param {string} dataUrl Imagen codificada en base64 (png, jpeg o webp).
 * @param {number} productId Identificador del producto, usado en el nombre del archivo.
 * @returns {Promise<string>} Ruta pública, p. ej. "/uploads/products/producto-4-1712345.jpg".
 */
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
