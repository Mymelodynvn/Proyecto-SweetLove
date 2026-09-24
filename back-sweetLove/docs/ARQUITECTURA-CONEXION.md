# Arquitectura conectada de Sweet Love

## Componentes

- `public/front/`: contiene el frontend HTML/CSS/JavaScript original.
- `server/api/`: expone las operaciones que comunican la interfaz con MySQL.
- `server/utils/db.ts`: crea el pool de conexiones MySQL.
- `app/`: panel administrativo Nuxt.
- `database/sweetlove.sql`: copia de la base de datos utilizada por el proyecto.
- `../sweetLove/backend/`: backend independiente original conservado como referencia.

## Flujo

`Frontend original -> /api/* -> MySQL`

`Panel Nuxt -> /api/* -> MySQL`

Ambas interfaces consultan la misma base de datos para productos, clientes y pedidos.

## Importante

La base de datos entregada modela un `itempedido` por `pedido`. Para no alterar el modelo original, el endpoint de creación de pedidos respeta esa estructura y crea una fila de pedido por cada línea del carrito. Una futura migración puede cambiar a un modelo `pedido -> muchos itempedido` sin afectar la interfaz.
