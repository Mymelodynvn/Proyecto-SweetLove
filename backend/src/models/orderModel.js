/**
 * Modelo de pedidos: consultas SQL sobre `pedido`, `itempedido`, `pago` y `envio`.
 * Relación: usuario 1 ─< pedido 1 ─< itempedido >─ producto; pedido 1 ─< pago 1 ─< envio.
 */
import { getPool } from '../config/database.js'

/**
 * Lista los pedidos con una fila por producto (el controlador las agrupa por pedido).
 * @returns {Promise<object[]>} Filas con orderId, customer, phone, address, productName, quantity, amount, date, dbStatus y paymentStatus.
 */
export const findAllWithItems = async () => {
  const [rows] = await getPool().query(`
    SELECT
      p.idPedido AS orderId,
      CONCAT(u.nombre, ' ', u.apellido) AS customer,
      u.celular AS phone,
      u.direccion AS address,
      pr.nombre AS productName,
      i.cantidad AS quantity,
      i.subTotal AS itemSubtotal,
      p.precioTotal AS amount,
      DATE_FORMAT(p.fecha, '%Y-%m-%d') AS date,
      p.estadoPedido AS dbStatus,
      COALESCE(pay.estadoPago, 'Sin pago registrado') AS paymentStatus
    FROM pedido p
    INNER JOIN usuario u ON u.idUser = p.idUser
    LEFT JOIN itempedido i ON i.idPedido = p.idPedido
    LEFT JOIN producto pr ON pr.idProducto = i.idProducto
    LEFT JOIN pago pay ON pay.idPedido = p.idPedido
    ORDER BY p.idPedido DESC, i.idItem ASC
  `)
  return rows
}

/**
 * Cambia el estado de un pedido.
 * @param {number} idPedido Identificador del pedido.
 * @param {string} status Nuevo estado (ya validado).
 * @returns {Promise<number>} Filas afectadas (0 si el pedido no existe).
 */
export const updateStatus = async (idPedido, status) => {
  const [result] = await getPool().execute('UPDATE pedido SET estadoPedido = ? WHERE idPedido = ?', [status, idPedido])
  return result.affectedRows
}

/**
 * Inserta la cabecera de un pedido nuevo en estado "Pendiente".
 * @param {import('mysql2/promise').PoolConnection} connection Conexión con transacción abierta.
 * @param {number} total Total del pedido.
 * @param {number} idUser Cliente que compra.
 * @returns {Promise<number>} Identificador del pedido.
 */
export const insertOrder = async (connection, total, idUser) => {
  const [result] = await connection.execute(
    "INSERT INTO pedido (precioTotal, fecha, estadoPedido, idUser) VALUES (?, CURDATE(), 'Pendiente', ?)",
    [total, idUser],
  )
  return result.insertId
}

/**
 * Inserta una línea (producto) de un pedido.
 * @param {import('mysql2/promise').PoolConnection} connection Conexión con transacción abierta.
 * @param {number} idPedido Pedido al que pertenece.
 * @param {{productId:number, quantity:number, unitPrice:number, subtotal:number}} item Línea validada.
 * @returns {Promise<void>}
 */
export const insertItem = async (connection, idPedido, item) => {
  await connection.execute(
    'INSERT INTO itempedido (cantidad, precioUnitario, subTotal, idPedido, idProducto) VALUES (?, ?, ?, ?, ?)',
    [item.quantity, item.unitPrice, item.subtotal, idPedido, item.productId],
  )
}

/**
 * Registra el pago inicial (estado "Pendiente") de un pedido.
 * @param {import('mysql2/promise').PoolConnection} connection Conexión con transacción abierta.
 * @param {number} idPedido Pedido pagado.
 * @param {number} amount Monto.
 * @param {string} provider Medio de pago (Nequi, Tarjeta...).
 * @returns {Promise<number>} Identificador del pago.
 */
export const insertPayment = async (connection, idPedido, amount, provider) => {
  const [result] = await connection.execute(
    "INSERT INTO pago (proveedorPago, monto, estadoPago, idPedido) VALUES (?, ?, 'Pendiente', ?)",
    [provider, amount, idPedido],
  )
  return result.insertId
}

/**
 * Crea el envío inicial (estado "Pendiente") asociado a un pago.
 * @param {import('mysql2/promise').PoolConnection} connection Conexión con transacción abierta.
 * @param {number} idPago Pago al que se asocia el envío.
 * @returns {Promise<void>}
 */
export const insertShipment = async (connection, idPago) => {
  await connection.execute(
    "INSERT INTO envio (idPago, idEstado) VALUES (?, (SELECT idEstado FROM estadoenvio WHERE nombre = 'Pendiente' LIMIT 1))",
    [idPago],
  )
}
