/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Construye el resumen real del panel administrativo a partir de MySQL.
 *
 * Esta ruta centraliza las consultas que necesita el dashboard para que la
 * interfaz no tenga que inventar cifras ni mantener datos de demostración.
 */
import { getDatabase } from '../utils/db'

export default defineEventHandler(async () => {
  const database = getDatabase()

  // Ejecutamos las consultas independientes en paralelo para reducir el tiempo
  // de respuesta del dashboard.
  const [summaryResult, productSalesResult, citySalesResult, ordersResult, topProductsResult, weeklyRevenueResult] = await Promise.all([
    database.query(`
      SELECT
        COUNT(*) AS totalOrders,
        COALESCE(SUM(CASE WHEN pd.estadoPedido <> 'Cancelado' THEN pd.precioTotal ELSE 0 END), 0) AS totalOrderValue,
        COALESCE((SELECT SUM(pa.monto) FROM pago pa WHERE pa.estadoPago = 'Aprobado'), 0) AS approvedRevenue,
        COALESCE(SUM(CASE WHEN pd.estadoPedido = 'Cancelado' THEN 1 ELSE 0 END), 0) AS cancelledOrders
      FROM pedido pd
    `),
    database.query(`
      SELECT
        pr.nombre AS name,
        COALESCE(SUM(ip.cantidad), 0) AS units,
        COALESCE(SUM(ip.subTotal), 0) AS revenue
      FROM itempedido ip
      INNER JOIN producto pr ON pr.idProducto = ip.idProducto
      INNER JOIN pedido pd ON pd.idPedido = ip.idPedido
      WHERE pd.estadoPedido <> 'Cancelado'
      GROUP BY pr.idProducto, pr.nombre
      ORDER BY revenue DESC
      LIMIT 6
    `),
    database.query(`
      SELECT
        COALESCE(NULLIF(TRIM(u.direccion), ''), 'Sin ciudad') AS city,
        COALESCE(SUM(pd.precioTotal), 0) AS revenue
      FROM pedido pd
      INNER JOIN usuario u ON u.idUser = pd.idUser
      WHERE pd.estadoPedido <> 'Cancelado'
      GROUP BY city
      ORDER BY revenue DESC
      LIMIT 6
    `),
    database.query(`
      SELECT
        CONCAT('SL', LPAD(pd.idPedido, 4, '0')) AS id,
        pd.precioTotal AS amount,
        DATE_FORMAT(pd.fecha, '%Y-%m-%d') AS date,
        pd.estadoPedido AS status,
        CONCAT(u.nombre, ' ', u.apellido) AS customer
      FROM pedido pd
      INNER JOIN usuario u ON u.idUser = pd.idUser
      ORDER BY pd.fecha DESC, pd.idPedido DESC
      LIMIT 5
    `),
    database.query(`
      SELECT
        pr.nombre AS name,
        COALESCE(SUM(CASE WHEN pd.estadoPedido <> 'Cancelado' THEN ip.cantidad ELSE 0 END), 0) AS sales,
        COALESCE(SUM(CASE WHEN pd.estadoPedido <> 'Cancelado' THEN ip.subTotal ELSE 0 END), 0) AS revenue,
        MAX(pr.cantidad) AS stock
      FROM producto pr
      LEFT JOIN itempedido ip ON ip.idProducto = pr.idProducto
      LEFT JOIN pedido pd ON pd.idPedido = ip.idPedido
      GROUP BY pr.idProducto, pr.nombre, pr.cantidad
      ORDER BY sales DESC, revenue DESC
      LIMIT 5
    `),
    database.query(`
      SELECT
        DATE_FORMAT(pd.fecha, '%Y-%m-%d') AS day,
        COALESCE((SELECT SUM(pa2.monto) FROM pago pa2 WHERE pa2.estadoPago = 'Aprobado' AND pa2.idPedido = pd.idPedido), 0) AS revenue
      FROM pedido pd
      LEFT JOIN pago pa ON pa.idPedido = pd.idPedido
      WHERE pd.fecha >= DATE_SUB((SELECT COALESCE(MAX(fecha), CURDATE()) FROM pedido), INTERVAL 6 DAY)
        AND pd.estadoPedido <> 'Cancelado'
      GROUP BY pd.fecha
      ORDER BY pd.fecha ASC
    `),
  ])

  const summary = (summaryResult[0] as Array<Record<string, unknown>>)[0] ?? {}
  const productSales = (productSalesResult[0] as Array<Record<string, unknown>>).map((row) => ({
    name: String(row.name),
    units: Number(row.units),
    revenue: Number(row.revenue),
  }))

  const citySales = (citySalesResult[0] as Array<Record<string, unknown>>).map((row) => ({
    city: String(row.city),
    revenue: Number(row.revenue),
  }))

  const orders = (ordersResult[0] as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    amount: Number(row.amount),
    date: String(row.date),
    status: String(row.status),
    customer: String(row.customer),
  }))

  const topProducts = (topProductsResult[0] as Array<Record<string, unknown>>).map((row) => ({
    name: String(row.name),
    sales: Number(row.sales),
    revenue: Number(row.revenue),
    stock: Number(row.stock),
  }))

  const weeklyRevenue = (weeklyRevenueResult[0] as Array<Record<string, unknown>>).map((row) => ({
    day: String(row.day),
    revenue: Number(row.revenue),
  }))

  const totalOrders = Number(summary.totalOrders ?? 0)
  const cancelledOrders = Number(summary.cancelledOrders ?? 0)
  const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0
  const maxCityRevenue = Math.max(...citySales.map((entry) => entry.revenue), 0)

  return {
    orders: totalOrders,
    revenue: Number(summary.approvedRevenue ?? 0),
    orderValue: Number(summary.totalOrderValue ?? 0),
    cancellationRate,
    productSales,
    citySales: citySales.map((entry) => ({
      ...entry,
      percent: maxCityRevenue > 0 ? Math.round((entry.revenue / maxCityRevenue) * 100) : 0,
    })),
    recentOrders: orders,
    topProducts,
    weeklyRevenue,
  }
})