/**
 * Archivo del proyecto Sweet Love.
 * Propósito: contiene la lógica correspondiente al módulo indicado por su nombre.
 * Los comentarios y nombres de funciones mantienen la intención del código en español.
 */
const {
    databaseConnectionPool,
    verifyDatabaseConnection,
    closeDatabaseConnectionPool
} = require("./connection");

const showAvailableProducts = async () => {
    const [productRows] = await databaseConnectionPool.query(
        "SELECT idProducto, nombre, precio, cantidad, estado FROM producto ORDER BY idProducto"
    );

    console.log(`La tabla "producto" tiene ${productRows.length} productos:`);
    console.table(productRows);
};

const runConnectionCheck = async () => {
    try {
        await verifyDatabaseConnection();
        await showAvailableProducts();
    } catch (connectionError) {
        console.error("No fue posible conectar con la base de datos sweetLove.");
        console.error(`Motivo: ${connectionError.message}`);
        console.error("Verifica que MySQL esté encendido y que las variables DATABASE_* coincidan con tu configuración local.");
        process.exitCode = 1;
    } finally {
        await closeDatabaseConnectionPool();
    }
};

runConnectionCheck();
