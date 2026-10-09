# Backend — API de Sweet Love

API REST en **Node.js + Express 5** con MySQL, organizada en capas MVC.

## Ejecutar

```bash
npm install
cp .env.example .env        # completa SESSION_SECRET y los datos de MySQL
npm run db:init             # solo la primera vez (crea la base con datos de demostración)
npm run dev                 # http://localhost:4000  (se reinicia al guardar)
```

## Scripts

| Script | Qué hace |
|---|---|
| `npm start` | Arranca la API (producción) |
| `npm run dev` | Arranca y recarga al guardar |
| `npm test` | Pruebas (sin MySQL): seguridad, validación, CORS y 404 |
| `npm run db:init` / `db:migrate` / `db:status` / `db:baseline` | Base de datos; ver [`../database/README.md`](../database/README.md) |

## Estructura

```
src/
├── server.js        arranque
├── app.js           arma Express (exporta createApp para las pruebas)
├── config/          env.js (variables) y database.js (pool MySQL, TLS opcional)
├── routes/          index.js: todas las URL y quién puede usarlas
├── controllers/     validan la petición y responden (auth, product, order, panel, health)
├── services/        orderService.js (checkout transaccional) y mercadoPagoService.js (enlace de pago, consulta y firma de avisos)
├── models/          SQL por tabla (user, product, order, payment, shipment, supplier, stats)
├── middleware/      auth.js (requireAdmin) y errorHandler.js
└── utils/           validate.js, httpError.js, product-image.js
scripts/db.js        ejecutor de base de datos (init, migrate, status, baseline)
tests/               pruebas con node:test
uploads/products/    imágenes subidas desde el panel
```

Regla de dependencias: `routes → controllers → services → models → MySQL`. Una capa nunca llama hacia arriba.
La vista (V) del MVC es el frontend: el backend responde JSON.

## Flujo de un pedido (`POST /api/orders`)

1. `routes/index.js` la enruta a `orderController.create` (ruta pública).
2. El controlador limpia y valida el cuerpo (`utils/validate.js`).
3. `orderService.createOrder` abre una transacción: busca o crea al cliente, bloquea cada producto
   (`FOR UPDATE`), toma el precio **de la base** (no del navegador), crea pedido, líneas, pago y envío, y descuenta stock.
4. Si algo falla, se revierte todo; el cliente recibe un error JSON claro.

## API

Base `/api`, formato JSON. La sesión viaja en la cookie `sweetlove-session`.

Los errores tienen siempre la misma forma: `{ "error": true, "statusCode": 401, "statusMessage": "…", "message": "…" }`.
Códigos: 400 datos inválidos · 401 sin sesión o credenciales incorrectas · 403 sin rol Administrador · 404 no existe ·
409 conflicto (correo repetido, sin stock, producto con pedidos) · 413 cuerpo muy grande (máx. 6 MB) ·
429 demasiados intentos · 500 error interno.

### Públicos (los usa la tienda)

| Ruta | Descripción |
|---|---|
| `GET /health` | Comprueba API y MySQL |
| `GET /products` | Catálogo: `id, name, description, price, stock, image, active, supplierId` |
| `POST /orders` | Crea un pedido. Body: `{ name, lastName?, email, phone?, address?, paymentMethod?, items: [{ productId, quantity }] }`. Responde `201 { ok, idPedido, total, cantidadProductos }`; con `paymentMethod: "Mercado Pago"` agrega `initPoint` (enlace de pago) o `paymentError` si no se pudo crear |
| `POST /payments/webhook` | Aviso de Mercado Pago. Consulta el pago a su API y actualiza `pago.estadoPago`. Valida la firma `x-signature` si hay `MP_WEBHOOK_SECRET` |
| `POST /auth/register` | Cuenta de cliente. Body `{ fullName, email, password }` (contraseña ≥ 8). `201` |
| `POST /auth/login` | Body `{ email, password }`. Abre sesión. Devuelve `{ message, user }` |
| `POST /auth/logout` | Cierra sesión |
| `GET /auth/me` | `{ user }` de la sesión actual (`user: null` si no hay) |

`user` = `{ idUser, nombre, apellido, email, idRol }` (idRol 1 Administrador, 2 Cliente, 3 Proveedor).

### Solo administrador

| Ruta | Descripción |
|---|---|
| `POST /products` | Crea producto. Body `{ name, description?, price, stock, active?, supplierId?, image? }`. `image` puede ser una Data URL (PNG/JPG/WEBP, máx. 3 MB) |
| `PUT /products/:id` | Actualiza producto (mismo body) |
| `DELETE /products/:id` | Elimina; `409` si tiene pedidos |
| `GET /orders` | Pedidos con sus productos resumidos |
| `PATCH /orders/:id` | Cambia estado. Body `{ status }`: `Pendiente`, `En preparación`, `Enviado`, `Completado`, `Cancelado`. `:id` admite `7` o `#SL0007`; por el proxy del frontend usa el número, porque `#` rompe la URL |
| `GET /customers` | Clientes con `orderCount`, `totalSpent` y `tier` (VIP ≥ 6 pedidos, Frecuente ≥ 2, Nuevo) |
| `GET /payments`, `/shipments`, `/suppliers` | Pagos, envíos y proveedores |
| `GET /dashboard` | Resumen del panel (totales, ventas por producto y ciudad, recientes, semana) |
| `GET /reports` | KPIs, ventas por producto, pedidos por estado, medios de pago, ranking de clientes |

`GET /uploads/products/<archivo>` sirve las imágenes subidas por el administrador.

## Cómo agregar un endpoint

1. **Modelo** (`models/`): la consulta SQL, una función con un comentario corto encima.
2. **Controlador** (`controllers/`): valida la entrada con `utils/validate.js`, llama al modelo y responde.
   Si hay varios pasos que deben ir juntos, créales un **servicio** (`services/`).
3. **Ruta** (`routes/index.js`): decláralo y, si es del panel, agrega `requireAdmin`.
4. **Prueba** (`tests/`) y fila en la tabla de API de este README.

Los errores se lanzan con `throw new HttpError(codigo, 'mensaje')`; `errorHandler` los convierte en JSON.
