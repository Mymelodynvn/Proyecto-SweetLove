# Migración del modelo de pedidos

## ¿Por qué se hizo?

El modelo anterior hacía que cada registro de `pedido` apuntara a un único `itempedido`. Además, el cliente estaba guardado en `itempedido`.

Para un comercio electrónico es más claro y flexible que:

- `pedido` identifique al cliente mediante `idUser`.
- `itempedido` identifique el pedido mediante `idPedido`.
- Un mismo `pedido` pueda tener muchos `itempedido`.

## Base de datos que ya tienes instalada

Como ya tienes datos en phpMyAdmin, **no necesitas borrar la base** para aplicar este cambio.

En phpMyAdmin:

1. Selecciona la base `sweetlove`.
2. Abre la pestaña **SQL**.
3. Copia el contenido de `database/migracion-pedidos-normalizada.sql`.
4. Pégalo y pulsa **Continuar**.
5. Comprueba que `pedido` ahora tenga `idUser` y que `itempedido` tenga `idPedido`.

La migración conserva los registros existentes y actualiza los estados `Pagado` a `Completado`, porque el estado del pedido y el estado del pago son conceptos diferentes.

## Resultado esperado

```text
usuario
   │
   └── pedido
          │
          ├── itempedido ── producto
          ├── itempedido ── producto
          └── itempedido ── producto
```

Ahora el carrito del frontend puede crear **un solo pedido con varios productos**.
