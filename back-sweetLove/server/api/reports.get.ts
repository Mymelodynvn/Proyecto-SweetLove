/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Genera los indicadores y series del módulo de reportes a partir de MySQL.
 * No inventa valores para métricas que la base de datos no puede calcular.
 */
import { getDatabase } from '../utils/db'

export default defineEventHandler(async () => {
  const database = getDatabase()

  const [summaryResult, productResult, statusResult, paymentMethodResult, customerResult] = await Promise.all([
    database.query(`
      SELECT
        COUNT(*) AS totalOrders,
        COALESCE(SUM(CASE WHEN estadoPedido <> 'Cancelado' THEN precioTotal ELSE 0 END), 0) AS orderValue,
        COALESCE((SELECT SUM(pa.monto) FROM pago pa WHERE pa.estadoPago = 'Aprobado'), 0) AS approvedRevenue,
        COALESCE(SUM(CASE WHEN estadoPedido = 'Cancelado' THEN 1 ELSE 0 END), 0) AS cancelledOrders,
        COALESCE(AVG(CASE WHEN estadoPedido <> 'Cancelado' THEN precioTotal END), 0) AS averageOrder
      FROM pedido pd
    `),
    database.query(`
      SELECT pr.nombre AS name, SUM(ip.cantidad) AS units, SUM(ip.subTotal) AS revenue
      FROM itempedido ip
      INNER JOIN producto pr ON pr.idProducto = ip.idProducto
      INNER JOIN pedido pd ON pd.idPedido = ip.idPedido
      WHERE pd.estadoPedido <> 'Cancelado'
      GROUP BY pr.idProducto, pr.nombre
      ORDER BY revenue DESC
    `),
    database.query(`
      SELECT estadoPedido AS status, COUNT(*) AS count
      FROM pedido
      GROUP BY estadoPedido
      ORDER BY count DESC
    `),
    database.query(`
      SELECT COALESCE(pa.proveedorPago, 'Sin especificar') AS name, COUNT(*) AS count, COALESCE(SUM(pa.monto), 0) AS amount
      FROM pago pa
      GROUP BY pa.proveedorPago
      ORDER BY amount DESC
    `),
    database.query(`
      SELECT
        CONCAT(u.nombre, ' ', u.apellido) AS name,
        COUNT(pd.idPedido) AS orderCount,
        COALESCE(SUM(pd.precioTotal), 0) AS totalSpent
      FROM usuario u
      LEFT JOIN pedido pd ON pd.idUser = u.idUser
      WHERE u.idRol = (SELECT idRol FROM rol WHERE nombre = 'Cliente' LIMIT 1)
      GROUP BY u.idUser, u.nombre, u.apellido
      ORDER BY totalSpent DESC
    `),
  ])

  const summary = (summaryResult[0] as Array<Record<string, unknown>>)[0] ?? {}
  const totalOrders = Number(summary.totalOrders ?? 0)
  const cancelledOrders = Number(summary.cancelledOrders ?? 0)

  const productSales = (productResult[0] as Array<Record<string, unknown>>).map((r) => ({
    name: String(r.name), units: Number(r.units ?? 0), revenue: Number(r.revenue ?? 0),
  }))
  const ordersByStatus = (statusResult[0] as Array<Record<string, unknown>>).map((r) => ({
    status: String(r.status ?? 'Sin estado'), count: Number(r.count ?? 0),
  }))
  const paymentMethods = (paymentMethodResult[0] as Array<Record<string, unknown>>).map((r) => ({
    name: String(r.name), count: Number(r.count ?? 0), amount: Number(r.amount ?? 0),
  }))
  const topCustomers = (customerResult[0] as Array<Record<string, unknown>>).map((r) => ({
    name: String(r.name), orderCount: Number(r.orderCount ?? 0), totalSpent: Number(r.totalSpent ?? 0),
  }))

  return {
    kpis: {
      approvedRevenue: Number(summary.approvedRevenue ?? 0),
      orderValue: Number(summary.orderValue ?? 0),
      totalOrders,
      averageOrder: Number(summary.averageOrder ?? 0),
      registeredCustomers: topCustomers.length,
      recurringCustomers: topCustomers.filter((c) => c.orderCount >= 2).length,
      cancellationRate: totalOrders ? (cancelledOrders / totalOrders) * 100 : 0,
    },
    productSales,
    ordersByStatus,
    paymentMethods,
    topCustomers,
  }
})
