/**
 * Conexión a MySQL.
 * Mantiene un único pool de conexiones reutilizable por todos los modelos.
 */
import mysql from 'mysql2/promise'
import { config } from './env.js'

let pool

/**
 * Opciones TLS para conectarse a MySQL cifrado.
 * Se validan el certificado y el nombre del servidor (rejectUnauthorized) con TLS 1.2 o superior.
 * @returns {{minVersion: string, rejectUnauthorized: boolean}|undefined} Opciones, o undefined si DATABASE_SSL no está activo.
 */
export const getSslOptions = () =>
  config.database.ssl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined

/**
 * Devuelve el pool de conexiones, creándolo la primera vez que se necesita.
 * @returns {import('mysql2/promise').Pool} Pool compartido de MySQL.
 */
export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name,
      ssl: getSslOptions(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}
