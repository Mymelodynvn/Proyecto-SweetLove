// Herramienta de línea de comandos para la base de datos (proceso separado de la API)
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mysql from 'mysql2/promise'
import { config } from '../src/config/env.js'
import { getSslOptions } from '../src/config/database.js'

const DATABASE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'database')
const MIGRATIONS_DIR = join(DATABASE_DIR, 'migrations')

// Abre una conexión que permite ejecutar archivos SQL con varias sentencias, recibe withDatabase
const connect = (withDatabase) =>
  mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: withDatabase ? config.database.name : undefined,
    ssl: getSslOptions(),
    multipleStatements: true,
  })

// Crea la tabla de control de migraciones si todavía no existe, recibe connection
const ensureMigrationsTable = async (connection) => {
  await connection.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name VARCHAR(200) NOT NULL PRIMARY KEY,
       appliedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
     ) ENGINE=InnoDB`,
  )
}

// Lista los nombres de los archivos de migración (.sql) ordenados
const listMigrationFiles = async () => (await readdir(MIGRATIONS_DIR)).filter((name) => name.endsWith('.sql')).sort()

// Devuelve el conjunto de migraciones ya aplicadas, recibe connection
const appliedMigrations = async (connection) => {
  const [rows] = await connection.query('SELECT name FROM schema_migrations')
  return new Set(rows.map((row) => row.name))
}

// Comando `init`: crea la base y carga esquema y datos de demostración, recibe force
const init = async (force) => {
  const server = await connect(false)
  await server.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`,
  )
  await server.end()

  const connection = await connect(true)
  const [tables] = await connection.query("SHOW TABLES LIKE 'usuario'")
  if (tables.length && !force) {
    throw new Error(`La base "${config.database.name}" ya tiene tablas. Para recrearla (borra los datos) usa: npm run db:init -- --force`)
  }

  await connection.query(await readFile(join(DATABASE_DIR, 'schema.sql'), 'utf8'))
  await connection.query(await readFile(join(DATABASE_DIR, 'seed.sql'), 'utf8'))

  await ensureMigrationsTable(connection)
  await connection.query('DELETE FROM schema_migrations')
  for (const name of await listMigrationFiles()) {
    await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [name])
  }

  await connection.end()
  console.log(`Base "${config.database.name}" creada con esquema y datos de demostración.`)
}

// Comando `migrate`: aplica las migraciones pendientes en orden
const migrate = async () => {
  const connection = await connect(true)
  await ensureMigrationsTable(connection)
  const applied = await appliedMigrations(connection)

  let count = 0
  for (const name of await listMigrationFiles()) {
    if (applied.has(name)) continue
    console.log(`Aplicando ${name}...`)
    await connection.query(await readFile(join(MIGRATIONS_DIR, name), 'utf8'))
    await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [name])
    count += 1
  }

  await connection.end()
  console.log(count ? `${count} migración(es) aplicada(s).` : 'No hay migraciones pendientes.')
}

// Comando `status`: muestra el estado de cada migración
const status = async () => {
  const connection = await connect(true)
  await ensureMigrationsTable(connection)
  const applied = await appliedMigrations(connection)
  for (const name of await listMigrationFiles()) {
    console.log(`${applied.has(name) ? '[aplicada] ' : '[pendiente]'} ${name}`)
  }
  await connection.end()
}

// Comando `baseline`: marca como aplicadas las migraciones hasta ese número, sin ejecutarlas, recibe upTo
const baseline = async (upTo) => {
  if (!/^\d+$/.test(upTo ?? '')) throw new Error('Indica el número de migración. Ejemplo: npm run db:baseline -- 001')

  const connection = await connect(true)
  await ensureMigrationsTable(connection)
  const applied = await appliedMigrations(connection)

  for (const name of await listMigrationFiles()) {
    if (parseInt(name, 10) > parseInt(upTo, 10) || applied.has(name)) continue
    await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [name])
    console.log(`Registrada como aplicada: ${name}`)
  }
  await connection.end()
}

const [command, ...flags] = process.argv.slice(2)
const commands = { init: () => init(flags.includes('--force')), migrate, status, baseline: () => baseline(flags[0]) }

if (!commands[command]) {
  console.error('Uso: node scripts/db.js <init|migrate|status|baseline>')
  process.exit(1)
}

commands[command]().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
