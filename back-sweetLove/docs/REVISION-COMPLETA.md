# Revisión completa de Sweet Love

Esta versión unifica el administrador Nuxt, la API, MySQL y el frontend HTML original.

## Correcciones principales

- El dashboard consulta pedidos, pagos, productos y clientes reales.
- Productos y pedidos usan el modelo normalizado.
- `pedido` se relaciona con `usuario` mediante `idUser`.
- `itempedido` se relaciona con `pedido` mediante `idPedido`.
- El estado `Completado` ya no se traduce incorrectamente a `Pagado`; el pago mantiene su propio estado.
- Se eliminan datos históricos ficticios del dashboard y reportes.
- El frontend original puede cargar productos desde `/api/products`.
- El frontend incluye una página de checkout que registra un solo pedido con varios artículos.
- Los componentes de configuración como blog, perfil y equipo que no tienen tablas equivalentes se mantienen como configuración local y se identifican en la documentación.

## Pruebas recomendadas

1. Abrir `/api/health`.
2. Abrir `/api/products` y `/api/orders`.
3. Abrir `/` y revisar el dashboard.
4. Probar el CRUD de productos.
5. Abrir `/customers` y comprobar usuarios con rol Cliente.
6. Abrir `/front/index.html`, agregar productos y finalizar pedido en `/front/checkout.html`.
