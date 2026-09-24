/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Registra un pedido completo en MySQL.
 *
 * Un pedido puede contener uno o varios productos. Toda la operación se
 * ejecuta dentro de una transacción para mantener la información consistente.
 */
import { getDatabase } from '../utils/db'

type OrderItemInput = {
  productId: number
  quantity: number
}

type CustomerInput = {
  name?: string
  lastName?: string
  email?: string
  phone?: string
  address?: string
}

type OrderBody = CustomerInput & {
  items?: OrderItemInput[]
  /** Compatibilidad con versiones anteriores que enviaban un solo producto. */
  productId?: number
  quantity?: number
  paymentMethod?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<OrderBody>(event)

  if (!body.name || !body.email) {
    throw createError({ statusCode: 400, statusMessage: 'Nombre y correo son obligatorios.' })
  }

  const items: OrderItemInput[] = body.items?.length
    ? body.items
    : body.productId && body.quantity
      ? [{ productId: Number(body.productId), quantity: Number(body.quantity) }]
      : []

  if (!items.length) {
    throw createError({ statusCode: 400, statusMessage: 'El pedido debe contener al menos un producto.' })
  }

  const database = getDatabase()
  const connection = await database.getConnection()

  try {
    await connection.beginTransaction()

    // Busca al cliente por correo. Si no existe, lo crea con el rol Cliente.
    const [users] = await connection.query(
      'SELECT idUser FROM usuario WHERE email = ? LIMIT 1',
      [body.email],
    )
    let userId = (users as Array<{ idUser: number }>)[0]?.idUser

    if (!userId) {
      const [insertUser] = await connection.execute(
        `INSERT INTO usuario (nombre, apellido, email, celular, direccion, contrasena, idRol)
         VALUES (?, ?, ?, ?, ?, ?, (SELECT idRol FROM rol WHERE nombre = 'Cliente' LIMIT 1))`,
        [body.name, body.lastName ?? '', body.email, body.phone ?? '', body.address ?? '', 'cliente-demo'],
      )
      userId = (insertUser as { insertId: number }).insertId
    } else {
      await connection.execute(
        'UPDATE usuario SET nombre = ?, apellido = ?, celular = ?, direccion = ? WHERE idUser = ?',
        [body.name, body.lastName ?? '', body.phone ?? '', body.address ?? '', userId],
      )
    }

    // Primero valida todos los productos y calcula el total del pedido.
    const validatedItems: Array<{ productId: number; quantity: number; unitPrice: number; subtotal: number }> = []

    for (const item of items) {
      const productId = Number(item.productId)
      const quantity = Math.max(1, Number(item.quantity))

      if (!Number.isInteger(productId) || !Number.isInteger(quantity)) {
        throw createError({ statusCode: 400, statusMessage: 'Uno de los productos del pedido no es válido.' })
      }

      const [products] = await connection.query(
        `SELECT idProducto, precio, cantidad, estado
         FROM producto
         WHERE idProducto = ?
         FOR UPDATE`,
        [productId],
      )
      const product = (products as Array<{ idProducto: number; precio: number; cantidad: number; estado: number }>)[0]

      if (!product) {
        throw createError({ statusCode: 404, statusMessage: `El producto ${productId} no existe.` })
      }

      if (!product.estado) {
        throw createError({ statusCode: 409, statusMessage: `El producto ${productId} no está disponible.` })
      }

      if (Number(product.cantidad) < quantity) {
        throw createError({ statusCode: 409, statusMessage: `No hay suficiente stock para el producto ${productId}.` })
      }

      const unitPrice = Number(product.precio)
      validatedItems.push({
        productId,
        quantity,
        unitPrice,
        subtotal: unitPrice * quantity,
      })
    }

    const total = validatedItems.reduce((sum, item) => sum + item.subtotal, 0)

    // El pedido identifica directamente al cliente que lo realizó.
    const [orderResult] = await connection.execute(
      `INSERT INTO pedido (precioTotal, fecha, estadoPedido, idUser)
       VALUES (?, CURDATE(), 'Pendiente', ?)`,
      [total, userId],
    )
    const orderId = (orderResult as { insertId: number }).insertId

    // Cada producto del carrito se convierte en una línea del mismo pedido.
    for (const item of validatedItems) {
      await connection.execute(
        `INSERT INTO itempedido (cantidad, precioUnitario, subTotal, idPedido, idProducto)
         VALUES (?, ?, ?, ?, ?)`,
        [item.quantity, item.unitPrice, item.subtotal, orderId, item.productId],
      )

      // Descuenta las unidades vendidas del inventario.
      await connection.execute(
        'UPDATE producto SET cantidad = cantidad - ? WHERE idProducto = ?',
        [item.quantity, item.productId],
      )
    }

    // Registra el medio y estado inicial del pago asociado al pedido.
    const [paymentResult] = await connection.execute(
      `INSERT INTO pago (proveedorPago, monto, estadoPago, idPedido)
       VALUES (?, ?, 'Pendiente', ?)`,
      [body.paymentMethod ?? 'Pendiente', total, orderId],
    )
    const paymentId = (paymentResult as { insertId: number }).insertId

    // Cada pedido nace con un envío en estado Pendiente.
    await connection.execute(
      `INSERT INTO envio (idPago, idEstado)
       VALUES (?, (SELECT idEstado FROM estadoenvio WHERE nombre = 'Pendiente' LIMIT 1))`,
      [paymentId],
    )

    await connection.commit()

    return {
      ok: true,
      idPedido: orderId,
      total,
      cantidadProductos: validatedItems.length,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
})
