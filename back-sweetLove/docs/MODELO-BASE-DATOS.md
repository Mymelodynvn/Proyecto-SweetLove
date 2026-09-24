# Modelo de base de datos Sweet Love

## ¿Qué se cambió?

Se normalizó la relación entre pedidos y sus productos.

### Modelo anterior

- `pedido` tenía `idItem`.
- `itempedido` tenía `idUser`.
- Por diseño, cada pedido podía apuntar directamente a un solo item.

### Modelo nuevo

- `pedido` tiene `idUser`, que identifica al cliente que realizó el pedido.
- `itempedido` tiene `idPedido`, que identifica el pedido al que pertenece cada línea.
- `itempedido` conserva `idProducto` para indicar qué producto se compró.

Esto permite representar correctamente un carrito con varios productos dentro de un mismo pedido.

Ejemplo:

```text
Pedido #10
├── Item 1 → Torta de chocolate x1
├── Item 2 → Cupcakes x6
└── Item 3 → Fresas con chocolate x2
```

## Relaciones principales

```text
rol 1 ───< usuario
usuario 1 ───< pedido
pedido 1 ───< itempedido
producto 1 ───< itempedido
proveedor 1 ───< producto
pedido 1 ───< pago
pago 1 ───< envio
envio >─── 1 estadoenvio
```

## Archivos SQL

- `database/sweetlove.sql`: script completo para crear una base nueva con el modelo actualizado.
- `database/migracion-pedidos-normalizada.sql`: migración para una base Sweet Love que ya tiene datos y utiliza el modelo anterior.

> La migración conserva los pedidos existentes. Después de ejecutarla, los registros antiguos quedan asociados al cliente mediante `pedido.idUser` y sus productos mediante `itempedido.idPedido`.
