# Dashboard con datos reales

El panel principal ya no utiliza cifras de demostración para pedidos, ingresos, ventas por producto, ventas por ciudad ni productos más vendidos.

## Origen de los datos

- **Pedidos:** tabla `pedido`.
- **Ingresos aprobados:** tabla `pago`, sumando únicamente pagos con `estadoPago = 'Aprobado'`.
- **Valor de pedidos:** suma de `pedido.precioTotal` de pedidos no cancelados.
- **Ventas por producto:** relación `itempedido` + `producto` + `pedido`.
- **Ventas por ciudad:** relación `pedido` + `usuario`, usando `usuario.direccion` como ciudad registrada.
- **Pedidos recientes:** relación `pedido` + `usuario`.
- **Productos más vendidos:** relación `producto` + `itempedido`.

La base de datos actual no contiene una tabla de gastos, visitas web ni canales de venta. Por eso esas cifras no se inventan en el dashboard.
