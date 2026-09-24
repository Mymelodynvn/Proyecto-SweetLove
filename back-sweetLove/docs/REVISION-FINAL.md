# Revisión final del proyecto Sweet Love

Esta versión integra el administrador Nuxt, la API Node/Nitro, MySQL y el frontend HTML original.

## Cambios principales
- Productos: lectura, creación, edición, duplicación y eliminación mediante MySQL.
- Pedidos: modelo normalizado `pedido -> itempedido -> producto` y creación transaccional de pedidos con varios productos.
- Dashboard: indicadores y gráficas calculados desde MySQL, sin cifras de demostración.
- Clientes: lectura de usuarios con rol Cliente y métricas de pedidos.
- Pagos, envíos y proveedores: endpoints y pantallas administrativas.
- Autenticación del frontend: inicio de sesión y registro mediante la API.
- Imágenes: `producto.imagen` se puede ampliar a MEDIUMTEXT mediante la migración indicada.
- Frontend original: se conserva bajo `public/front/`.
- Blog, equipo, perfil y preferencias permanecen en almacenamiento local porque la base de datos entregada no contiene tablas equivalentes.
