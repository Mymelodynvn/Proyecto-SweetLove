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
2. El controlador valida el cuerpo en el servidor (`utils/validate.js`): nombre, correo, celular (7–10 números), dirección (6–150 caracteres) y productos.
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
| `POST /orders` | Crea un pedido. Body: `{ name, lastName?, email, phone, address, paymentMethod?, items: [{ productId, quantity }] }` (`phone` y `address` son obligatorios y se validan). Máximo 30 productos y 50 unidades por producto (las líneas repetidas se suman); `paymentMethod` solo admite `"Mercado Pago"` (el valor por defecto). Si no alcanza el stock responde `409` y nunca queda en negativo. Si el correo ya tiene una cuenta registrada y no hay sesión de esa cuenta, responde `409` con `code: LOGIN_REQUIRED` (los correos de compradores invitados sí pueden comprar sin sesión). Límites: 10 pedidos por correo cada hora y 100 por IP cada 15 minutos (`429`). Responde `201 { ok, idPedido, total, cantidadProductos, initPoint }`, con `initPoint` (enlace de pago) o `paymentError` si no se pudo crear |
| `POST /payments/webhook` | Aviso de Mercado Pago. Consulta el pago a su API y actualiza `pago.estadoPago` solo si el monto y la moneda coinciden con el pedido. Valida la firma `x-signature`; **en producción sin `MP_WEBHOOK_SECRET` rechaza todos los avisos** |
| `POST /payments/confirm` | Body `{ orderId, token }`. La tienda lo llama al volver de Mercado Pago: el backend consulta el pago y actualiza el estado (respaldo del webhook). El `token` viaja en la dirección de regreso (`?pedido=…&t=…`); sin él o con uno falso responde `403`, así nadie consulta pedidos ajenos adivinando números. Responde `{ status }` |
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

De 8 a 16 caracteres, sin espacios ni los caracteres `<` o `>` (el resto de símbolos sí se aceptan). Debe tener al menos una letra, un número y un carácter especial (`@ # $ ! ? * .`), no ser una clave obvia (`1234567890`, secuencias, una letra repetida)
ni contener el correo o el nombre. Se comprueban en el servidor (`utils/password.js`); la tienda y el panel muestran las reglas,
no dejan teclear espacios y las validan también al enviar. Las reglas valen al registrarse, restablecer y cambiar la contraseña:
las cuentas que ya existían con otra clave siguen entrando igual hasta que la cambien.

El **correo** no admite espacios (ni al inicio ni al final) y tiene máximo 100 caracteres.

**Sesiones:** la sesión lleva una huella de la contraseña. Si la contraseña cambia (desde la cuenta o con el enlace del correo), las sesiones
abiertas en otros dispositivos dejan de valer; la que hizo el cambio sigue abierta.

**Bloqueo de login:** 10 intentos fallidos por correo en 15 minutos. Como cualquiera podría agotar los intentos de un correo ajeno, quien es dueño
del correo lo desbloquea al instante eligiendo una contraseña nueva con el enlace de «¿Olvidaste tu contraseña?».

Los errores llevan `code: WEAK_PASSWORD`. Los códigos de la respuesta de error que la interfaz reconoce: `EMAIL_NOT_VERIFIED`, `INVALID_TOKEN`, `WRONG_PASSWORD`, `WEAK_PASSWORD`.

### Correo

Los correos de verificación y de recuperación salen por **Gmail**, de una de estas formas (si hay varias, se usa la primera de la tabla):

| Forma | Variables | Cuándo usarla |
|---|---|---|
| **Puente con Apps Script (HTTPS)** | `MAIL_RELAY_URL`, `MAIL_RELAY_SECRET` | En **Render gratis**, que bloquea los puertos SMTP. **No vence**, no pide publicar ninguna app ni tener dominio. Unos 100 correos al día |
| API de Gmail (HTTPS) | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_USER` | Si necesitas más cupo. Con la app en modo *Prueba* el refresh token vence a los 7 días |
| SMTP con contraseña de aplicación | `SMTP_USER`, `SMTP_PASSWORD` | En local o en un servidor que permita SMTP |

**Sin ninguna no se envían correos**: las cuentas nuevas no exigen verificación y recuperar la contraseña responde 503.

#### Configurar el puente con Apps Script

1. Entra a <https://script.google.com> con la cuenta de Gmail que enviará los correos y pulsa **Proyecto nuevo**.
2. Borra el contenido y pega el de [`scripts/correo-apps-script.gs`](scripts/correo-apps-script.gs). Cambia `CLAVE` por una clave larga que inventes (la misma irá como `MAIL_RELAY_SECRET`).
3. Elige la función `probarEnvio` y pulsa **Ejecutar**. Google pide permisos: *Revisar permisos → tu cuenta → Avanzado → Ir a… (no seguro) → Permitir*. Te llega un correo de prueba.
4. **Implementar → Nueva implementación → Aplicación web**. En *Ejecutar como* elige **Yo** y en *Quién tiene acceso* **Cualquier persona** (el backend no inicia sesión en Google; lo que protege el script es la clave). Pulsa **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
5. En `backend/.env` y en las variables de Render: `MAIL_RELAY_URL=la URL` y `MAIL_RELAY_SECRET=la clave`.

Si cambias el código del script, publica una versión nueva (*Implementar → Administrar implementaciones → editar → Versión nueva*): la URL no cambia. Si los correos fallan, el registro del backend dice la causa: `clave incorrecta` (las dos claves no coinciden) o una página HTML (el acceso no es «Cualquier persona»).

#### Configurar la API de Gmail

1. En <https://console.cloud.google.com/> crea un proyecto y activa la **Gmail API** (<https://console.cloud.google.com/apis/library/gmail.googleapis.com>).
2. En **Google Auth Platform** (pantalla de consentimiento): tipo **Externa**, llena el nombre de la app y el correo de soporte, y en **Público (Audience)** pulsa **Publicar aplicación**. En modo *Testing* el refresh token vence a los 7 días.
3. En **Credenciales > Crear credenciales > ID de cliente de OAuth** elige **Aplicación de escritorio**. Guarda el *Client ID* y el *Client Secret* en `backend/.env` (`GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`).
4. En `backend/` ejecuta `npm run gmail:url`, abre el enlace con la cuenta de Gmail que enviará los correos y pulsa **Permitir** (si Google avisa que la app no está verificada: *Avanzado > Ir a… (no seguro)*; es tu propia app).
5. El navegador mostrará un error de conexión a `localhost:8080`: es normal. Copia el `code=…` de la barra de direcciones (o la dirección completa) y ejecuta `npm run gmail:token -- "EL_CODIGO"`. Imprime `GMAIL_REFRESH_TOKEN`.
6. Pon `GMAIL_REFRESH_TOKEN` y `GMAIL_USER` (el correo autorizado, que será el remitente) en `backend/.env` y, para producción, en las variables de entorno de Render. Son secretos: no los subas a git.

Si Google responde `invalid_grant`, el refresh token venció o se revocó (por ejemplo al cambiar la contraseña de la cuenta): repite los pasos 4 y 5. El código del paso 5 sirve una sola vez y vence en minutos.

#### SMTP

1. En tu cuenta de Google activa la **verificación en dos pasos** (Seguridad).
2. Crea una **contraseña de aplicación** en <https://myaccount.google.com/apppasswords> (16 letras; los espacios no importan).
3. En `backend/.env`: `SMTP_USER=tucorreo@gmail.com` y `SMTP_PASSWORD=la contraseña de aplicación`. El remitente es esa misma cuenta (Gmail no deja usar otro).

**Diseño de los correos:** lo arma `src/services/emailTemplate.js` (tarjeta con el logo, botón y enlace de respaldo, con estilos en línea para que lo lean Gmail y Outlook). El logo es una imagen que el cliente de correo descarga, así que debe tener una dirección pública: por defecto `FRONTEND_URL/tienda/assets/recursos/logo-email.png`, o la que pongas en `EMAIL_LOGO_URL` si la tienda aún no está publicada.

Si Gmail rechaza el inicio de sesión (`535 Username and Password not accepted`), la contraseña de aplicación es incorrecta o está revocada: genera otra.
Otros servidores SMTP funcionan con `SMTP_HOST` y `SMTP_PORT`. Los hosts gratuitos como Render bloquean los puertos SMTP; allí usa el puente con Apps Script o la API de Gmail (o `RESEND_API_KEY`, que también va por HTTPS pero exige un dominio verificado para escribir a terceros).

### Solo administrador

| Ruta | Descripción |
|---|---|
| `POST /products` | Crea producto. Body `{ name, description?, price, stock, active?, supplierId?, image? }`. `image` puede ser una Data URL (PNG/JPG/WEBP, máx. 3 MB; se guarda como archivo), una ruta propia (`/tienda/assets/...`) o una **URL** `http(s)://…` de hasta 255 caracteres; cualquier otro valor se rechaza con 400 |
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
