/**
 * Servicio de pedidos: reglas de negocio del checkout.
 * Crear un pedido toca varias tablas (usuario, pedido, itempedido, producto,
 * pago, envio), por eso todo ocurre dentro de una única transacción: o se
 * guarda completo o no se guarda nada.
 */
import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { getPool } from '../config/database.js'
import { HttpError } from '../utils/httpError.js'
import * as userModel from '../models/userModel.js'
import * as productModel from '../models/productModel.js'
import * as orderModel from '../models/orderModel.js'

/**
 * Busca al cliente por correo y lo crea si no existe; si existe actualiza sus datos de entrega.
 * Un cliente creado así no tiene contraseña utilizable: debe registrarse para poder iniciar sesión.
 * @param {import('mysql2/promise').PoolConnection} connection Conexión con transacción abierta.
 * @param {{name:string, lastName:string, email:string, phone:string, address:string}} customer Datos del comprador.
 * @returns {Promise<number>} Identificador del usuario (cliente).
 */
const findOrCreateCustomer = async (connection, customer) => {
  const existing = await userModel.findByEmail(customer.email, connection)

  if (existing) {
    await userModel.updateContact(
      existing.idUser,
      { nombre: customer.name, apellido: customer.lastName, celular: customer.phone, direccion: customer.address },
      connection,
    )
    return existing.idUser
  }

  // Contraseña aleatoria que nadie conoce: la cuenta no permite iniciar sesión.
  const unusableHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10)
  return userModel.create(
    {
      nombre: customer.name,
      apellido: customer.lastName,
      email: customer.email,
      celular: customer.phone,
      direccion: customer.address,
      contrasenaHash: unusableHash,
      rol: 'Cliente',
    },
    connection,
  )
}

/**
 * Valida cada producto del carrito contra la base (existe, está activo y hay stock)
 * y toma el precio desde la base de datos, nunca desde el navegador.
 * @param {import('mysql2/promise').PoolConnection} connection Conexión con transacción abierta.
 * @param {Array<{productId:number, quantity:number}>} items Líneas del carrito.
 * @returns {Promise<Array<{productId:number, quantity:number, unitPrice:number, subtotal:number}>>} Líneas validadas.
 */
const validateItems = async (connection, items) => {
  const validated = []

  for (const item of items) {
    const productId = Number(item.productId)
    const quantity = Number(item.quantity)

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
      throw new HttpError(400, 'Uno de los productos del pedido no es válido.')
    }

    const product = await productModel.lockForSale(connection, productId)
    if (!product) throw new HttpError(404, `El producto ${productId} no existe.`)
    if (!product.estado) throw new HttpError(409, `El producto ${productId} no está disponible.`)
    if (Number(product.cantidad) < quantity) throw new HttpError(409, `No hay suficiente stock para el producto ${productId}.`)

    const unitPrice = Number(product.precio)
    validated.push({ productId, quantity, unitPrice, subtotal: unitPrice * quantity })
  }

  return validated
}

/**
 * Registra un pedido completo: cliente, cabecera, líneas, descuento de stock, pago y envío inicial.
 * @param {object} input Datos ya validados por el controlador.
 * @param {{name:string, lastName:string, email:string, phone:string, address:string}} input.customer Comprador.
 * @param {Array<{productId:number, quantity:number}>} input.items Productos del carrito.
 * @param {string} input.paymentMethod Medio de pago elegido.
 * @returns {Promise<{ok:true, idPedido:number, total:number, cantidadProductos:number}>} Resumen del pedido creado.
 */
export const createOrder = async ({ customer, items, paymentMethod }) => {
  const connection = await getPool().getConnection()

  try {
    await connection.beginTransaction()

    const userId = await findOrCreateCustomer(connection, customer)
    const lines = await validateItems(connection, items)
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0)

    const orderId = await orderModel.insertOrder(connection, total, userId)

    for (const line of lines) {
      await orderModel.insertItem(connection, orderId, line)
      await productModel.decreaseStock(connection, line.productId, line.quantity)
    }

    const paymentId = await orderModel.insertPayment(connection, orderId, total, paymentMethod)
    await orderModel.insertShipment(connection, paymentId)

    await connection.commit()
    return { ok: true, idPedido: orderId, total, cantidadProductos: lines.length }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
