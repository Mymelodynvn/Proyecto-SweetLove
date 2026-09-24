/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Obtiene los clientes directamente desde la tabla usuario.
 * Las métricas se calculan mediante la relación pedido.idUser.
 */
import { getDatabase } from '../utils/db'

export default defineEventHandler(async () => {
  const database = getDatabase()
  const [rows] = await database.query(`
    SELECT
      u.idUser AS id,
      CONCAT(u.nombre, ' ', u.apellido) AS name,
      u.email,
      u.celular AS phone,
      u.direccion AS city,
      COUNT(p.idPedido) AS orderCount,
      COALESCE(SUM(p.precioTotal), 0) AS totalSpent
    FROM usuario u
    LEFT JOIN pedido p ON p.idUser = u.idUser AND p.estadoPedido <> 'Cancelado'
    WHERE u.idRol = (SELECT idRol FROM rol WHERE nombre = 'Cliente' LIMIT 1)
    GROUP BY u.idUser, u.nombre, u.apellido, u.email, u.celular, u.direccion
    ORDER BY totalSpent DESC
  `)

  return (rows as Array<Record<string, unknown>>).map((row) => {
    const orderCount = Number(row.orderCount)
    return {
      ...row,
      orderCount,
      totalSpent: Number(row.totalSpent),
      tier: orderCount >= 6 ? 'VIP' : orderCount >= 2 ? 'Frecuente' : 'Nuevo',
    }
  })
})
