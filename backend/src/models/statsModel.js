/**
 * Modelo de estadísticas: consultas agregadas que alimentan el dashboard y los
 * reportes del panel. Solo calcula con datos reales de MySQL; no inventa cifras.
 */
import { getPool } from '../config/database.js'

/**
 * Ejecuta una consulta y devuelve únicamente sus filas.
 * @param {string} sql Consulta SQL de solo lectura.
 * @returns {Promise<object[]>} Filas resultantes.
 */
const rows = async (sql) => {
  const [result] = await getPool().query(sql)
  return result
}

/**
 * Totales generales de pedidos: cantidad, valor, ingresos aprobados, cancelados y ticket promedio.
 * @returns {Promise<object>} Una fila con totalOrders, orderValue, approvedRevenue, cancelledOrders y averageOrder.
 */
export const orderSummary = async () => {
  const [summary] = await rows(`
    SELECT
      COUNT(*) AS totalOrders,
      COALESCE(SUM(CASE WHEN pd.estadoPedido <> 'Cancelado' THEN pd.precioTotal ELSE 0 END), 0) AS orderValue,
      COALESCE((SELECT SUM(pa.monto) FROM pago pa WHERE pa.estadoPago = 'Aprobado'), 0) AS approvedRevenue,
      COALESCE(SUM(CASE WHEN pd.estadoPedido = 'Cancelado' THEN 1 ELSE 0 END), 0) AS cancelledOrders,
      COALESCE(AVG(CASE WHEN pd.estadoPedido <> 'Cancelado' THEN pd.precioTotal END), 0) AS averageOrder
    FROM pedido pd
  `)
  return summary ?? {}
}

/**
 * Ventas por producto (unidades e ingresos), excluyendo pedidos cancelados.
 * @param {number} [limit] Máximo de productos a devolver; sin valor devuelve todos.
 * @returns {Promise<object[]>} Filas con name, units y revenue, de mayor a menor ingreso.
 */
export const productSales = (limit) =>
  rows(`
    SELECT pr.nombre AS name, COALESCE(SUM(ip.cantidad), 0) AS units, COALESCE(SUM(ip.subTotal), 0) AS revenue
    FROM itempedido ip
    INNER JOIN producto pr ON pr.idProducto = ip.idProducto
    INNER JOIN pedido pd ON pd.idPedido = ip.idPedido
    WHERE pd.estadoPedido <> 'Cancelado'
    GROUP BY pr.idProducto, pr.nombre
    ORDER BY revenue DESC
    ${limit ? `LIMIT ${Number(limit)}` : ''}
  `)

/**
 * Ingresos agrupados por ciudad (dirección del cliente), top 6.
 * @returns {Promise<object[]>} Filas con city y revenue.
 */
export const citySales = () =>
  rows(`
    SELECT
      COALESCE(NULLIF(TRIM(u.direccion), ''), 'Sin ciudad') AS city,
      COALESCE(SUM(pd.precioTotal), 0) AS revenue
    FROM pedido pd
    INNER JOIN usuario u ON u.idUser = pd.idUser
    WHERE pd.estadoPedido <> 'Cancelado'
    GROUP BY city
    ORDER BY revenue DESC
    LIMIT 6
  `)

/**
 * Los 5 pedidos más recientes.
 * @returns {Promise<object[]>} Filas con id, amount, date, status y customer.
 */
export const recentOrders = () =>
  rows(`
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
  `)

/**
 * Los 5 productos más vendidos con su stock actual.
 * @returns {Promise<object[]>} Filas con name, sales, revenue y stock.
 */
export const topProducts = () =>
  rows(`
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
  `)

/**
 * Ingresos aprobados de los últimos 7 días con actividad.
 * @returns {Promise<object[]>} Filas con day y revenue.
 */
export const weeklyRevenue = () =>
  rows(`
    SELECT
      DATE_FORMAT(pd.fecha, '%Y-%m-%d') AS day,
      COALESCE((SELECT SUM(pa2.monto) FROM pago pa2 WHERE pa2.estadoPago = 'Aprobado' AND pa2.idPedido = pd.idPedido), 0) AS revenue
    FROM pedido pd
    LEFT JOIN pago pa ON pa.idPedido = pd.idPedido
    WHERE pd.fecha >= DATE_SUB((SELECT COALESCE(MAX(fecha), CURDATE()) FROM pedido), INTERVAL 6 DAY)
      AND pd.estadoPedido <> 'Cancelado'
    GROUP BY pd.fecha
    ORDER BY pd.fecha ASC
  `)

/**
 * Cantidad de pedidos por estado.
 * @returns {Promise<object[]>} Filas con status y count.
 */
export const ordersByStatus = () =>
  rows(`
    SELECT estadoPedido AS status, COUNT(*) AS count
    FROM pedido
    GROUP BY estadoPedido
    ORDER BY count DESC
  `)

/**
 * Pagos agrupados por medio de pago.
 * @returns {Promise<object[]>} Filas con name, count y amount.
 */
export const paymentMethods = () =>
  rows(`
    SELECT COALESCE(pa.proveedorPago, 'Sin especificar') AS name, COUNT(*) AS count, COALESCE(SUM(pa.monto), 0) AS amount
    FROM pago pa
    GROUP BY pa.proveedorPago
    ORDER BY amount DESC
  `)

/**
 * Clientes ordenados por lo gastado (incluye clientes sin pedidos).
 * @returns {Promise<object[]>} Filas con name, orderCount y totalSpent.
 */
export const customerRanking = () =>
  rows(`
    SELECT
      CONCAT(u.nombre, ' ', u.apellido) AS name,
      COUNT(pd.idPedido) AS orderCount,
      COALESCE(SUM(pd.precioTotal), 0) AS totalSpent
    FROM usuario u
    LEFT JOIN pedido pd ON pd.idUser = u.idUser
    WHERE u.idRol = (SELECT idRol FROM rol WHERE nombre = 'Cliente' LIMIT 1)
    GROUP BY u.idUser, u.nombre, u.apellido
    ORDER BY totalSpent DESC
  `)
