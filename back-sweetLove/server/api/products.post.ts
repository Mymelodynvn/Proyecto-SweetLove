/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Registra un nuevo producto en la tabla producto.
 */
import { getDatabase } from '../utils/db'
import { saveProductImage } from '../utils/product-image'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name?: string; description?: string; price?: number; stock?: number;
    image?: string | null; active?: boolean; supplierId?: number | null
  }>(event)

  if (!body.name || body.price == null || body.stock == null) {
    throw createError({ statusCode: 400, statusMessage: 'Nombre, precio y stock son obligatorios.' })
  }

  const database = getDatabase()
  const [result] = await database.execute(
    `INSERT INTO producto (nombre, descripcion, precio, cantidad, imagen, estado, idProveedor)
     VALUES (?, ?, ?, ?, NULL, ?, ?)`,
    [body.name, body.description ?? '', Number(body.price), Number(body.stock), body.active === false ? 0 : 1, body.supplierId ?? null],
  )

  const insertId = (result as { insertId: number }).insertId
  // Las imágenes cargadas desde el navegador se guardan como archivo para
  // mantener en MySQL una ruta corta y reutilizable en cualquier página.
  if (body.image) {
    const imagePath = await saveProductImage(body.image, insertId)
    await database.execute('UPDATE producto SET imagen = ? WHERE idProducto = ?', [imagePath, insertId])
  }
  const [rows] = await database.query('SELECT * FROM producto WHERE idProducto = ?', [insertId])
  return { producto: rows[0] }
})
