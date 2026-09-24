/**
 * Sweet Love: archivo documentado en español.
 * Responsabilidad: contiene la lógica correspondiente a su nombre y ubicación.
 */
/**
 * Crea y reutiliza el grupo de conexiones de MySQL utilizado por la API de Sweet Love.
 * Las credenciales se leen desde las variables de entorno configuradas para el proyecto.
 */
import mysql from 'mysql2/promise'

let pool: mysql.Pool | undefined

export const getDatabase = () => {
  if (pool) return pool

  const config = useRuntimeConfig()
  pool = mysql.createPool({
    host: String(config.databaseHost),
    port: Number(config.databasePort),
    user: String(config.databaseUser),
    password: String(config.databasePassword),
    database: String(config.databaseName),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
  })

  return pool
}
