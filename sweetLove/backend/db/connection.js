/**
 * Configuración de la conexión MySQL del backend independiente de Sweet Love.
 * Este archivo puede usarse si se decide separar la API del proyecto Nuxt.
 */

const mysql = require("mysql2/promise");

const DEFAULT_DATABASE_HOST = "localhost";
const DEFAULT_DATABASE_PORT = 3306;
const DEFAULT_DATABASE_USER = "root";
const DEFAULT_DATABASE_NAME = "sweetlove";
const MAX_POOL_CONNECTIONS = 10;

const databaseConnectionConfig = {
    host: process.env.DATABASE_HOST ?? DEFAULT_DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT ?? DEFAULT_DATABASE_PORT),
    user: process.env.DATABASE_USER ?? DEFAULT_DATABASE_USER,
    password: process.env.DATABASE_PASSWORD ?? "",
    database: process.env.DATABASE_NAME ?? DEFAULT_DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: MAX_POOL_CONNECTIONS,
    queueLimit: 0,
    namedPlaceholders: true
};

const databaseConnectionPool = mysql.createPool(databaseConnectionConfig);

const verifyDatabaseConnection = async () => {
    const activeConnection = await databaseConnectionPool.getConnection();

    try {
        await activeConnection.ping();
        console.log(`Connected to database "${databaseConnectionConfig.database}" at ${databaseConnectionConfig.host}:${databaseConnectionConfig.port}`);
    } finally {
        activeConnection.release();
    }
};

const closeDatabaseConnectionPool = () => databaseConnectionPool.end();

module.exports = {
    databaseConnectionPool,
    verifyDatabaseConnection,
    closeDatabaseConnectionPool
};
