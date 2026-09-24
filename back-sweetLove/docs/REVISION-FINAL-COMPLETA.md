# Revisión final completa

## Integración
- MySQL es la fuente de datos para productos, pedidos, clientes, pagos, envíos, proveedores y estadísticas.
- El frontend público original consume el catálogo mediante `/api/products`.
- El checkout agrupa el carrito en un único pedido con múltiples `itempedido`.
- El administrador consume las mismas tablas y permite administrar productos y estados de pedidos.

## Modelo de pedidos
`usuario 1 ───< pedido 1 ───< itempedido >─── 1 producto`.

## Funcionalidades conectadas
- Productos: lectura, creación, edición, duplicación y eliminación.
- Pedidos: lectura y actualización de estado; creación transaccional desde el frontend.
- Clientes: consulta desde `usuario` y métricas derivadas de `pedido`.
- Dashboard y reportes: cálculos reales desde MySQL.
- Pagos, envíos y proveedores: consultas administrativas.
- Autenticación pública: inicio de sesión y registro contra `usuario`.

## Funcionalidades locales
Blog, equipo, perfil y preferencias permanecen en almacenamiento local porque el esquema de base de datos suministrado no contiene tablas equivalentes. Esto está documentado para evitar presentar datos ficticios como datos de MySQL.

## Validaciones
Se revisó la sintaxis de los archivos JavaScript del frontend con Node y no se detectaron errores de sintaxis. La compilación completa de Nuxt no se ejecutó en este entorno porque no dispone de acceso de red al registro de paquetes; debe validarse en el equipo con `pnpm install` y `pnpm build`.
