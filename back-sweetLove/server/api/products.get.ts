/**
 * @file server/api/products.get.ts
 * @description Endpoint REST (GET /api/products) para obtener el catálogo completo de productos
 * desde la tabla `producto` en MySQL. Mapea los campos de la base de datos al esquema esperado
 * por la tienda y asigna imágenes de respaldo desde la carpeta pública.
 *
 * @project Sweet Love E-Commerce
 * @module Server/API
 */

import { getDatabase } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    const database = getDatabase()
    const [rows] = await database.query(`
      SELECT idProducto AS id, nombre AS name, descripcion AS description,
             precio AS price, cantidad AS stock, imagen AS image, estado AS active,
             idProveedor AS supplierId
      FROM producto
      ORDER BY idProducto
    `)

    /**
     * Mapeo de imágenes estáticas servidas directamente desde public/assets/
     */
    const imageById: Record<number, string> = {
      1: '/assets/images/trufas.jpeg',
      2: '/assets/images/combox3.jpeg',
      3: '/assets/images/maryuri.jpeg',
      4: '/assets/images/fresas.jpeg',
    }

    return (rows as Array<Record<string, unknown>>).map((row) => {
      const productId = Number(row.id)
      const dbImage = row.image ? String(row.image) : null

      return {
        ...row,
        emoji: '🍰',
        category: 'Repostería',
        rating: '—',
        // Prioriza la imagen registrada en la BD; de lo contrario, aplica la ruta estática o el logo oficial
        image: dbImage || imageById[productId] || '/assets/recursos/logo1.png',
      }
    })
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Error al consultar el catálogo en MySQL: ${error.message}`,
    })
  }
})