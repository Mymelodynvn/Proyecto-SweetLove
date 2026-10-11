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
| `npm test` | Pruebas sin base de datos (seguridad, validación, CORS, Mercado Pago). Con `TEST_DATABASE_NAME` también corren las de integración |
| `npm run db:init` / `db:migrate` / `db:status` / `db:baseline` | Base de datos; ver [`../database/README.md`](../database/README.md) |

## Estructura

```
src/
├── server.js        arranque
├── app.js           arma Express (exporta createApp para las pruebas)
├── config/          env.js (variables) y database.js (pool MySQL, TLS opcional)
├── routes/          index.js: todas las URL y quién puede usarlas
├── controllers/     validan la petición y responden (auth, product, order, panel, health)
├── services/        orderService (checkout), accountService (registro, verificación y contraseñas), paymentService (concilia pagos y cancela pedidos vencidos), mercadoPagoService y mailer (correo)
├── models/          SQL por tabla (user, token, product, order, payment, shipment, supplier, stats)
├── middleware/      auth.js (requireAdmin) y errorHandler.js
└── utils/           validate.js (celular, dirección, nombres), password.js (reglas de contraseña), httpError.js, product-image.js
scripts/db.js        ejecutor de base de datos (init, migrate, status, baseline)
tests/               pruebas con node:test
uploads/products/    imágenes subidas desde el panel
```

Regla de dependencias: `routes → controllers → services → models → MySQL`. Una capa nunca llama hacia arriba.
La vista (V) del MVC es el frontend: el backend responde JSON.

## Flujo de un pedido (`POST /api/orders`)

1. `routes/index.js` la enruta a `orderController.create` (ruta pública).
2. El controlador valida el cuerpo en el servidor (`utils/validate.js`): nombre, correo, celular (7–15 números), dirección (6–150 caracteres) y productos.
3. `orderService.createOrder` abre una transacción: busca al cliente por correo (si no existe crea una **cuenta de invitado**; si existe **no le cambia sus datos**, solo completa los vacíos), bloquea cada producto
   (`FOR UPDATE`), toma el precio **de la base** (no del navegador), crea pedido, líneas, pago y envío, y descuenta stock.
4. Los datos de entrega se guardan **en el pedido** (`nombreEnvio`, `celularEnvio`, `direccionEnvio`), no en la cuenta.
5. Si algo falla, se revierte todo; el cliente recibe un error JSON claro.
6. Con Mercado Pago, el enlace de pago vence a los `ORDER_TTL_MINUTES` (30 por defecto). Un pedido sin pagar pasado ese plazo se **cancela solo y devuelve el stock** (revisión cada 5 minutos; antes consulta a Mercado Pago para no cancelar uno ya pagado).

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
| `POST /orders` | Crea un pedido. Body: `{ name, lastName?, email, phone, address, paymentMethod?, items: [{ productId, quantity }] }` (`phone` y `address` son obligatorios y se validan). Responde `201 { ok, idPedido, total, cantidadProductos }`; con `paymentMethod: "Mercado Pago"` agrega `initPoint` (enlace de pago) o `paymentError` si no se pudo crear |
| `POST /payments/webhook` | Aviso de Mercado Pago. Consulta el pago a su API y actualiza `pago.estadoPago` solo si el monto y la moneda coinciden con el pedido. Valida la firma `x-signature`; **en producción sin `MP_WEBHOOK_SECRET` rechaza todos los avisos** |
| `POST /payments/confirm` | Body `{ orderId }`. La tienda lo llama al volver de Mercado Pago: el backend consulta el pago y actualiza el estado (respaldo del webhook). Responde `{ status }` |
| `POST /auth/register` | Cuenta de cliente. Body `{ fullName, email, password }` (ver reglas de contraseña abajo). `201 { message, needsVerification }`. Con correo configurado la cuenta queda pendiente de verificar; si el correo era de una cuenta de invitado, se envía un enlace para activarla |
| `POST /auth/login` | Body `{ email, password }`. Abre sesión. Devuelve `{ message, user }`. `403` con `code: EMAIL_NOT_VERIFIED` si falta verificar el correo |
| `POST /auth/logout` | Cierra sesión |
| `POST /auth/change-password` | Requiere sesión. Body `{ currentPassword, newPassword }`. `400 WRONG_PASSWORD` si la actual no coincide |
| `GET /auth/me` | `{ user }` de la sesión actual (`user: null` si no hay) |
| `POST /auth/forgot-password` | Body `{ email }`. Envía el enlace para restablecer (responde igual exista o no la cuenta). `503` si no hay correo configurado |
| `POST /auth/reset-password` | Body `{ token, password }`. Fija la contraseña nueva; el enlace es de **un solo uso** y dura 1 hora. Una contraseña débil no gasta el enlace |
| `POST /auth/verify-email` | Body `{ token }`. Verifica el correo (enlace de un solo uso, 24 h) |
| `POST /auth/resend-verification` | Body `{ email }`. Reenvía el correo de verificación (máx. 3 por hora y cuenta) |

`user` = `{ idUser, nombre, apellido, email, idRol }` (idRol 1 Administrador, 2 Cliente, 3 Proveedor).

### Reglas de contraseña

Entre 8 y 72 caracteres (bcrypt ignora lo que pase de 72 bytes), al menos una letra y un número, que no sea una clave
obvia (`12345678`, `Password1`, secuencias, una letra repetida) ni contenga el correo o el nombre. Se comprueban en el
servidor (`utils/password.js`); la tienda y el panel muestran las reglas y las validan también al escribir.
Los errores llevan `code: WEAK_PASSWORD`. Los códigos de la respuesta de error que la interfaz reconoce: `EMAIL_NOT_VERIFIED`, `INVALID_TOKEN`, `WRONG_PASSWORD`, `WEAK_PASSWORD`.

### Correo

Con `RESEND_API_KEY` se envían los correos de verificación y de recuperación por [Resend](https://resend.com) (por HTTPS, funciona
en Render). **Sin esa clave no se envían correos**: las cuentas nuevas no exigen verificación y recuperar la contraseña responde 503.
Con un remitente de prueba (`onboarding@resend.dev`) Resend solo entrega a la cuenta dueña de la clave; para otros destinatarios hay que verificar un dominio.

### Solo administrador

| Ruta | Descripción |
|---|---|
| `POST /products` | Crea producto. Body `{ name, description?, price, stock, active?, supplierId?, image? }`. `image` puede ser una Data URL (PNG/JPG/WEBP, máx. 3 MB) |
| `PUT /products/:id` | Actualiza producto (mismo body) |
| `DELETE /products/:id` | Elimina; `409` si tiene pedidos |
| `GET /orders` | Pedidos con sus productos resumidos |
| `PATCH /orders/:id` | Cambia estado. **Cancelar** devuelve el stock una sola vez y un pedido cancelado no se puede reactivar (409). Body `{ status }`: `Pendiente`, `En preparación`, `Enviado`, `Completado`, `Cancelado`. `:id` admite `7` o `#SL0007`; por el proxy del frontend usa el número, porque `#` rompe la URL |
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

## Pruebas

```bash
npm test                                   # sin base de datos: seguridad, validación, CORS y Mercado Pago simulado
# Con base de datos (recrea la base indicada; el nombre debe terminar en _test):
TEST_DATABASE_NAME=sweetlove_test npm test          # Linux / macOS / Git Bash
$env:TEST_DATABASE_NAME='sweetlove_test'; npm test  # PowerShell
```

Las de integración cubren cuentas y contraseñas (verificación, recuperación, cambio, invitados), validación de pedidos,
cinco compras simultáneas de la última unidad, cancelación con devolución de stock, pagos aprobados/rechazados/en proceso,
vencimiento de pedidos y seguridad (CORS, cabeceras, permisos). Mercado Pago y el correo se simulan.
