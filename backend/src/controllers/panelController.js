/**
 * Controlador del panel administrativo: clientes, pagos, envíos, proveedores,
 * dashboard y reportes. Son consultas de solo lectura que dan forma a los datos
 * que muestra el panel.
 */
import * as userModel from '../models/userModel.js'
import * as paymentModel from '../models/paymentModel.js'
import * as shipmentModel from '../models/shipmentModel.js'
import * as supplierModel from '../models/supplierModel.js'
import * as statsModel from '../models/statsModel.js'

/** Pedidos desde los que un cliente se considera "VIP". */
const VIP_MIN_ORDERS = 6
/** Pedidos desde los que un cliente se considera "Frecuente". */
const FREQUENT_MIN_ORDERS = 2

/**
 * Calcula un porcentaje seguro (0 si el total es 0).
 * @param {number} part Parte.
 * @param {number} total Total.
 * @returns {number} Porcentaje entre 0 y 100.
 */
const percent = (part, total) => (total > 0 ? (part / total) * 100 : 0)

/**
 * GET /api/customers — clientes con su nivel (VIP, Frecuente, Nuevo) según cantidad de pedidos.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta con la lista de clientes.
 * @returns {Promise<void>}
 */
export const customers = async (_req, res) => {
  const rows = await userModel.findCustomersWithTotals()

  res.json(
    rows.map((row) => {
      const orderCount = Number(row.orderCount)
      return {
        ...row,
        orderCount,
        totalSpent: Number(row.totalSpent),
        tier: orderCount >= VIP_MIN_ORDERS ? 'VIP' : orderCount >= FREQUENT_MIN_ORDERS ? 'Frecuente' : 'Nuevo',
      }
    }),
  )
}

/**
 * GET /api/payments — pagos registrados con su pedido.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta con la lista de pagos.
 * @returns {Promise<void>}
 */
export const payments = async (_req, res) => {
  const rows = await paymentModel.findAll()

  res.json(
    rows.map((row) => ({
      id: Number(row.id),
      provider: String(row.provider ?? 'No especificado'),
      amount: Number(row.amount ?? 0),
      status: String(row.status ?? 'Pendiente'),
      orderId: Number(row.orderId ?? 0),
    })),
  )
}

/**
 * GET /api/shipments — envíos con su estado descriptivo.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta con la lista de envíos.
 * @returns {Promise<void>}
 */
export const shipments = async (_req, res) => {
  const rows = await shipmentModel.findAll()

  res.json(
    rows.map((row) => ({
      id: Number(row.id),
      paymentId: Number(row.paymentId ?? 0),
      statusId: Number(row.statusId ?? 0),
      status: String(row.status ?? 'Pendiente'),
    })),
  )
}

/**
 * GET /api/suppliers — proveedores registrados.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta con la lista de proveedores.
 * @returns {Promise<void>}
 */
export const suppliers = async (_req, res) => {
  const rows = await supplierModel.findAll()

  res.json(
    rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      email: String(row.email ?? ''),
      phone: String(row.phone ?? ''),
      userId: row.userId == null ? null : Number(row.userId),
    })),
  )
}

/**
 * GET /api/dashboard — resumen del panel: totales, ventas por producto y ciudad,
 * pedidos recientes, productos destacados e ingresos de la semana.
 * Las consultas son independientes, así que se ejecutan en paralelo.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta con los indicadores.
 * @returns {Promise<void>}
 */
export const dashboard = async (_req, res) => {
  const [summary, productSales, citySales, recentOrders, topProducts, weeklyRevenue] = await Promise.all([
    statsModel.orderSummary(),
    statsModel.productSales(6),
    statsModel.citySales(),
    statsModel.recentOrders(),
    statsModel.topProducts(),
    statsModel.weeklyRevenue(),
  ])

  const cities = citySales.map((row) => ({ city: String(row.city), revenue: Number(row.revenue) }))
  const maxCityRevenue = Math.max(...cities.map((entry) => entry.revenue), 0)

  res.json({
    orders: Number(summary.totalOrders ?? 0),
    revenue: Number(summary.approvedRevenue ?? 0),
    orderValue: Number(summary.orderValue ?? 0),
    cancellationRate: percent(Number(summary.cancelledOrders ?? 0), Number(summary.totalOrders ?? 0)),
    productSales: productSales.map((row) => ({ name: String(row.name), units: Number(row.units), revenue: Number(row.revenue) })),
    citySales: cities.map((entry) => ({ ...entry, percent: Math.round(percent(entry.revenue, maxCityRevenue)) })),
    recentOrders: recentOrders.map((row) => ({
      id: String(row.id),
      amount: Number(row.amount),
      date: String(row.date),
      status: String(row.status),
      customer: String(row.customer),
    })),
    topProducts: topProducts.map((row) => ({
      name: String(row.name),
      sales: Number(row.sales),
      revenue: Number(row.revenue),
      stock: Number(row.stock),
    })),
    weeklyRevenue: weeklyRevenue.map((row) => ({ day: String(row.day), revenue: Number(row.revenue) })),
  })
}

/**
 * GET /api/reports — indicadores (KPIs) y series del módulo de reportes.
 * @param {import('express').Request} _req Petición (sin uso).
 * @param {import('express').Response} res Respuesta con KPIs y tablas.
 * @returns {Promise<void>}
 */
export const reports = async (_req, res) => {
  const [summary, productSales, ordersByStatus, paymentMethods, customerRanking] = await Promise.all([
    statsModel.orderSummary(),
    statsModel.productSales(),
    statsModel.ordersByStatus(),
    statsModel.paymentMethods(),
    statsModel.customerRanking(),
  ])

  const topCustomers = customerRanking.map((row) => ({
    name: String(row.name),
    orderCount: Number(row.orderCount ?? 0),
    totalSpent: Number(row.totalSpent ?? 0),
  }))

  res.json({
    kpis: {
      approvedRevenue: Number(summary.approvedRevenue ?? 0),
      orderValue: Number(summary.orderValue ?? 0),
      totalOrders: Number(summary.totalOrders ?? 0),
      averageOrder: Number(summary.averageOrder ?? 0),
      registeredCustomers: topCustomers.length,
      recurringCustomers: topCustomers.filter((customer) => customer.orderCount >= FREQUENT_MIN_ORDERS).length,
      cancellationRate: percent(Number(summary.cancelledOrders ?? 0), Number(summary.totalOrders ?? 0)),
    },
    productSales: productSales.map((row) => ({ name: String(row.name), units: Number(row.units ?? 0), revenue: Number(row.revenue ?? 0) })),
    ordersByStatus: ordersByStatus.map((row) => ({ status: String(row.status ?? 'Sin estado'), count: Number(row.count ?? 0) })),
    paymentMethods: paymentMethods.map((row) => ({ name: String(row.name), count: Number(row.count ?? 0), amount: Number(row.amount ?? 0) })),
    topCustomers,
  })
}
