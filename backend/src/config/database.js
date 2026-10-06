// Conexión a MySQL
import mysql from 'mysql2/promise'
import { config } from './env.js'

let pool

// Opciones TLS para conectarse a MySQL cifrado
export const getSslOptions = () =>
  config.database.ssl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined

// Devuelve el pool de conexiones, creándolo la primera vez que se necesita
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
