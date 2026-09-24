/**
 * Gestiona las imágenes de productos cargadas desde el administrador.
 * Convierte una Data URL en un archivo dentro de `public/uploads/products`
 * y devuelve la ruta pública que se puede guardar en MySQL.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export const saveProductImage = async (image: string, productId: number) => {
  if (!image.startsWith('data:image/')) return image

  const match = image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/)
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: 'Formato de imagen no compatible.' })
  }

  const [, format, base64] = match
  const extension = format === 'jpeg' ? 'jpg' : format
  const directory = join(process.cwd(), 'public', 'uploads', 'products')
  await mkdir(directory, { recursive: true })
  const fileName = `producto-${productId}-${Date.now()}.${extension}`
  await writeFile(join(directory, fileName), Buffer.from(base64, 'base64'))
  return `/uploads/products/${fileName}`
}
