// Modelo de pedidos: consultas SQL sobre `pedido`, `itempedido`, `pago` y `envio`
import { getPool } from '../config/database.js'

// Lista los pedidos con una fila por producto (el controlador las agrupa por pedido)
export const findAllWithItems = async () => {
  const [rows] = await getPool().query(`
    SELECT
      p.idPedido AS orderId,
      CONCAT(u.nombre, ' ', u.apellido) AS customer,
      COALESCE(NULLIF(p.celularEnvio, ''), u.celular) AS phone,
      COALESCE(NULLIF(p.direccionEnvio, ''), u.direccion) AS address,
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

// Cambia el estado de un pedido, recibe idPedido, status
export const updateStatus = async (idPedido, status) => {
  const [result] = await getPool().execute('UPDATE pedido SET estadoPedido = ? WHERE idPedido = ?', [status, idPedido])
  return result.affectedRows
}

// Inserta la cabecera de un pedido nuevo en estado "Pendiente" con sus datos de entrega, recibe connection, total, idUser, shipping
export const insertOrder = async (connection, total, idUser, shipping = {}) => {
  const [result] = await connection.execute(
    `INSERT INTO pedido (precioTotal, fecha, estadoPedido, idUser, nombreEnvio, celularEnvio, direccionEnvio)
     VALUES (?, CURDATE(), 'Pendiente', ?, ?, ?, ?)`,
    [total, idUser, shipping.name ?? null, shipping.phone ?? null, shipping.address ?? null],
  )
  return result.insertId
}

// Inserta una línea (producto) de un pedido, recibe connection, idPedido, item
export const insertItem = async (connection, idPedido, item) => {
  await connection.execute(
    'INSERT INTO itempedido (cantidad, precioUnitario, subTotal, idPedido, idProducto) VALUES (?, ?, ?, ?, ?)',
    [item.quantity, item.unitPrice, item.subtotal, idPedido, item.productId],
  )
}

// Registra el pago inicial (estado "Pendiente") de un pedido, recibe connection, idPedido, amount, provider
export const insertPayment = async (connection, idPedido, amount, provider) => {
  const [result] = await connection.execute(
    "INSERT INTO pago (proveedorPago, monto, estadoPago, idPedido) VALUES (?, ?, 'Pendiente', ?)",
    [provider, amount, idPedido],
  )
  return result.insertId
}

// Crea el envío inicial (estado "Pendiente") asociado a un pago, recibe connection, idPago
export const insertShipment = async (connection, idPago) => {
  await connection.execute(
    "INSERT INTO envio (idPago, idEstado) VALUES (?, (SELECT idEstado FROM estadoenvio WHERE nombre = 'Pendiente' LIMIT 1))",
    [idPago],
  )
}

// Cambia el estado del pago de un pedido (Aprobado, Rechazado, Pendiente...), recibe idPedido, status
export const updatePaymentStatus = async (idPedido, status) => {
  const [result] = await getPool().execute('UPDATE pago SET estadoPago = ? WHERE idPedido = ?', [status, idPedido])
  return result.affectedRows
}

// Devuelve el pago de un pedido (el más reciente) con el estado del pedido, recibe idPedido
export const findPaymentByOrder = async (idPedido) => {
  const [rows] = await getPool().query(
    `SELECT pa.idPago, pa.proveedorPago, pa.monto, pa.estadoPago, p.idPedido, p.estadoPedido
     FROM pedido p LEFT JOIN pago pa ON pa.idPedido = p.idPedido
     WHERE p.idPedido = ? ORDER BY pa.idPago DESC LIMIT 1`,
    [idPedido],
  )
  return rows[0]
}

// Lista los pedidos con Mercado Pago sin pagar (pago Pendiente o Rechazado) creados hace más de N minutos, recibe minutes
export const findUnpaidMercadoPagoOrders = async (minutes) => {
  const [rows] = await getPool().query(
    `SELECT p.idPedido
     FROM pedido p INNER JOIN pago pa ON pa.idPedido = p.idPedido
     WHERE pa.proveedorPago = 'Mercado Pago' AND pa.estadoPago IN ('Pendiente', 'Rechazado')
       AND p.estadoPedido <> 'Cancelado' AND p.creadoEn < DATE_SUB(NOW(), INTERVAL ? MINUTE)
     ORDER BY p.idPedido`,
    [minutes],
  )
  return rows.map((row) => row.idPedido)
}

// Cancela un pedido y devuelve sus productos al inventario, una sola vez; devuelve false si ya estaba cancelado, recibe idPedido, paymentStatus
export const cancelAndRestock = async (idPedido, paymentStatus) => {
  const connection = await getPool().getConnection()
  try {
    await connection.beginTransaction()
    // Se bloquea el pedido para que dos cancelaciones simultáneas no devuelvan el stock dos veces
    const [orders] = await connection.query('SELECT estadoPedido FROM pedido WHERE idPedido = ? FOR UPDATE', [idPedido])
    if (!orders.length || orders[0].estadoPedido === 'Cancelado') {
      await connection.rollback()
      return false
    }

    const [lines] = await connection.query('SELECT idProducto, cantidad FROM itempedido WHERE idPedido = ?', [idPedido])
    for (const line of lines) {
      await connection.execute('UPDATE producto SET cantidad = cantidad + ? WHERE idProducto = ?', [line.cantidad, line.idProducto])
    }

    await connection.execute("UPDATE pedido SET estadoPedido = 'Cancelado' WHERE idPedido = ?", [idPedido])
    // Un pago ya aprobado no se toca (requiere un reembolso); el resto pasa al estado indicado
    await connection.execute(
      "UPDATE pago SET estadoPago = ? WHERE idPedido = ? AND estadoPago IN ('Pendiente', 'En proceso', 'Rechazado')",
      [paymentStatus, idPedido],
    )
    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Devuelve el estado actual de un pedido, o undefined si no existe, recibe idPedido
export const findStatus = async (idPedido) => {
  const [rows] = await getPool().query('SELECT estadoPedido FROM pedido WHERE idPedido = ?', [idPedido])
  return rows[0]?.estadoPedido
}
