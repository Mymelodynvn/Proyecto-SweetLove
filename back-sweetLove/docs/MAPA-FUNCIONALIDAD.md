# Mapa de funcionalidad

## Conectado a MySQL
- Dashboard: consultas agregadas reales.
- Productos: listar, crear, editar, duplicar y eliminar.
- Pedidos: listar y cambiar estado; creación transaccional desde el frontend.
- Clientes: usuarios con rol Cliente y métricas derivadas de pedidos.
- Pagos: consulta de pagos.
- Envíos: consulta de envíos y estados.
- Proveedores: consulta de proveedores.
- Reportes: indicadores y tablas calculadas desde MySQL.
- Autenticación pública: inicio de sesión y registro contra `usuario`.

## Almacenamiento local
- Blog, equipo, perfil y preferencias del panel se mantienen localmente porque el esquema de base de datos entregado no incluye tablas equivalentes.

## Frontend público
El frontend HTML original está en `public/front/` y consume `/api/products` y `/api/orders` cuando se abre desde `http://localhost:3000/front/index.html`.
