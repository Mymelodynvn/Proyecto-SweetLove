/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Obtiene los proveedores registrados en la tabla proveedor.
 */
import { getDatabase } from '../utils/db'

export default defineEventHandler(async () => {
  const database = getDatabase()
  const [rows] = await database.query(`
    SELECT
      idProveedor AS id,
      nombre AS name,
      email,
      celular AS phone,
      idUser AS userId
    FROM proveedor
    ORDER BY idProveedor
  `)

  return (rows as Array<Record<string, unknown>>).map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    userId: row.userId == null ? null : Number(row.userId),
  }))
})
