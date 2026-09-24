# Configuración de MySQL

## Conexión local

El administrador Nuxt toma estos valores desde el archivo `.env` ubicado en la raíz del proyecto:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=sweetlove
```

## Modelo de pedidos actualizado

La base de datos utiliza una relación normalizada entre pedidos y sus productos. Un pedido pertenece a un usuario y puede tener varios items.

No se debe volver a usar `pedido.idItem` ni `itempedido.idUser` porque esas columnas pertenecían al modelo anterior.

Para una base existente, utilizar:

```text
database/migracion-pedidos-normalizada.sql
```

Para una base nueva, utilizar:

```text
database/sweetlove.sql
```

## Verificación

Con MySQL iniciado en XAMPP y el servidor Nuxt ejecutándose, estas rutas permiten comprobar la conexión:

```text
/api/health
/api/products
/api/orders
/api/customers
```
