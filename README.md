# Sweet Love

Tienda en línea y panel de administración de una pastelería artesanal.

| Carpeta | Qué es | Tecnología |
|---|---|---|
| [`backend/`](backend/) | API REST (reglas de negocio y acceso a datos) | Node.js, Express, MySQL — arquitectura MVC |
| [`frontend/`](frontend/) | Lo que ve el usuario: panel de administración y tienda pública | Nuxt 4 (Vue 3, Tailwind, shadcn-vue) y HTML/JS para la tienda |
| [`database/`](database/) | Esquema, datos de demostración y migraciones de MySQL | SQL + ejecutor `npm run db:*` (se corre desde `backend/`) |

```
 Navegador ──► frontend (Nuxt, :3000) ──proxy /api──► backend (Express, :4000) ──► MySQL
                 ├─ /admin …   panel de administración
                 └─ /tienda/   tienda pública (HTML/JS)
```

El navegador solo habla con el frontend. Nuxt reenvía `/api` y `/uploads` al backend, así la cookie de sesión es de mismo origen (sin CORS ni cookies de terceros).

## Puesta en marcha (desarrollo)

Requisitos: Node.js 22 o superior y MySQL 8 (XAMPP, o una base en la nube).

```bash
# 1. Instalar dependencias de los dos proyectos
cd backend  && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Configurar
cp backend/.env.example backend/.env      # edita SESSION_SECRET y los datos de MySQL
cp frontend/.env.example frontend/.env    # API_URL=http://localhost:4000

# 3. Crear la base de datos con datos de demostración
cd backend && npm run db:init && cd ..

# 4. Arrancar (en dos terminales)
cd backend  && npm run dev     # http://localhost:4000
cd frontend && npm run dev     # http://localhost:3000
```

- **Tienda** (la raíz `/` redirige aquí): <http://localhost:3000/tienda/index.html>. Los clientes inician sesión con el icono de perfil.
- **Panel de administración**: <http://localhost:3000/admin>. Solo entran cuentas con rol Administrador.
- Cuentas de demostración (de `database/seed.sql`), contraseña `SweetLove2026`: `admin@example.com` (administrador) y `laura@example.com` (cliente con pedidos); la lista completa está en [`database/README.md`](database/README.md). **No las publiques: en producción usa `npm run db:init -- --sin-demo`.**

## Comandos útiles

Se ejecutan dentro de la carpeta indicada.

| Carpeta | Comando | Qué hace |
|---|---|---|
| `backend/` | `npm test` | Pruebas del backend (no necesitan MySQL) |
| `backend/` | `npm run db:init` | Crea la base con esquema, datos base y datos de demostración (con `-- --sin-demo`, sin estos últimos) |
| `backend/` | `npm run db:migrate` | Aplica migraciones pendientes a una base existente |
| `backend/` | `npm run db:status` | Muestra el estado de las migraciones |
| `backend/` | `npm run db:baseline -- 003` | Registra como aplicadas migraciones que ya hiciste a mano |
| `frontend/` | `npm run build` | Compila el frontend para producción |

## Variables de entorno

**Backend** (`backend/.env`):

| Variable | Para qué |
|---|---|
| `SESSION_SECRET` | Firma la cookie de sesión. **Obligatoria**, mínimo 32 caracteres. Genera una con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Conexión a MySQL |
| `DATABASE_SSL` | `true` si la base es de un proveedor en la nube que exige conexión cifrada (TiDB Cloud, Aiven…); `false` con XAMPP |
| `PORT` | Puerto de la API (por defecto 4000) |
| `MAIL_RELAY_URL`, `MAIL_RELAY_SECRET` | Envío de correos (verificar cuenta y recuperar contraseña) por un **puente con Google Apps Script** (HTTPS): sirve en Render gratis y no vence. Pasos en [`backend/README.md`](backend/README.md#correo) |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_USER` | Alternativa por la **API de Gmail** (HTTPS); en modo *Prueba* el refresh token vence a los 7 días |
| `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Alternativa por SMTP con Gmail (tu correo y una **contraseña de aplicación**); Render gratis la bloquea. Sin ninguna de las tres no se envían correos |
| `ORDER_TTL_MINUTES` | Minutos que un pedido con Mercado Pago espera su pago antes de cancelarse y devolver el stock (30 por defecto) |
| `CORS_ORIGIN` | Orígenes extra permitidos, separados por coma. Vacío si el frontend usa el proxy (lo normal) |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago (de prueba o de producción). **Secreto**, solo en el backend |
| `MP_WEBHOOK_SECRET` | Clave secreta de los webhooks de Mercado Pago (opcional; valida que los avisos sean de ellos) |
| `MP_CURRENCY_ID` | Moneda de la cuenta de Mercado Pago (`COP` para Colombia) |
| `FRONTEND_URL` | URL pública de la tienda, adonde vuelve el cliente después de pagar |
| `BACKEND_PUBLIC_URL` | URL pública del backend, adonde Mercado Pago envía los avisos de pago (vacía en local) |

**Frontend** (`frontend/.env`): `API_URL`, la dirección del backend. Se lee al **construir**; si la cambias, vuelve a construir.

## Pagos con Mercado Pago (Checkout Pro)

1. En el carrito, "Finalizar pedido" abre `tienda/checkout.html`: un formulario con los datos de entrega (se valida campo por campo y se rellena solo si hay sesión) y el resumen del pedido. Al pagar, se crea el pedido en la base (estado `Pendiente`, pago `Pendiente`) y el backend pide a Mercado Pago un enlace de pago.
2. El cliente paga en la página de Mercado Pago y vuelve a `tienda/pagoResultado.html`.
3. Mercado Pago avisa al backend en `POST /api/payments/webhook`; el backend consulta el pago y actualiza `pago.estadoPago` (`Aprobado`, `Rechazado`, `Reembolsado` o `Pendiente`).

Para probar con dinero ficticio: usa las **credenciales de prueba** de tu aplicación en [Mercado Pago Developers](https://www.mercadopago.com.co/developers), una **cuenta de prueba de tipo Comprador** para pagar y las tarjetas de la sección *Tarjetas de prueba* (con el nombre `APRO` el pago se aprueba).
Los avisos (webhook) solo llegan si el backend tiene URL pública: configúrala en *Webhooks* de la aplicación como `https://TU-BACKEND/api/payments/webhook` (evento *Pagos*) y define `BACKEND_PUBLIC_URL`.
Para pagar hay que entrar a Mercado Pago con la cuenta **compradora de prueba** (mejor en una ventana privada): con una cuenta real, Mercado Pago responde "Una de las partes con la que intentas hacer el pago es de prueba".
Un pedido cuyo pago no se aprueba conserva el stock descontado hasta que alguien lo cancele en el panel.

## Seguridad

- Contraseñas con **bcrypt**; sesión en cookie **firmada y httpOnly** (8 h), con atributo `secure` en producción.
- Todas las rutas del panel exigen rol Administrador en el backend; el rol se consulta a la base en cada petición.
- **Contraseñas:** de 8 a 16 caracteres, sin espacios ni los caracteres `<` o `>`, con letra y número y sin claves obvias; el servidor las valida siempre. El correo no admite espacios. Recuperación por correo con enlaces de un solo uso (1 h), verificación de correo, y cambio de contraseña pidiendo la actual.
- Límites de intentos: login (10 fallos por correo cada 15 min; el dueño del correo se desbloquea restableciendo la contraseña), correos de recuperación (6 por hora), registros por IP y pedidos (10 por correo por hora).
- Las sesiones abiertas dejan de valer cuando la contraseña cambia. Los pedidos admiten como máximo 30 productos y 50 unidades por producto, y el stock nunca queda en negativo.
- Cabeceras de seguridad (`helmet` en la API; `nosniff`, `X-Frame-Options`, `Referrer-Policy` en el frontend). Protección CSRF: la cookie es `SameSite=Lax` y la API solo lee JSON (un formulario de otro sitio no puede enviar nada válido); está cubierto por pruebas.
- **Compras como invitado:** crean una cuenta sin contraseña que no deja iniciar sesión. Un correo que ya tiene cuenta registrada solo compra iniciando sesión con ella (así nadie llena de pedidos la cuenta de otra persona); no se sobrescriben datos de cuentas existentes (la entrega se guarda en el pedido). El dueño del correo puede activar esa cuenta al registrarse (le llega un enlace).
- El checkout calcula los precios en el servidor, dentro de una transacción con bloqueo de stock.

## Publicar (por ejemplo en Render)

Dos servicios Node más una base MySQL:

1. **Base de datos:** una MySQL externa (Render no ofrece MySQL gestionado). Desde `backend/`, `npm run db:init -- --sin-demo` crea las tablas y los datos base (roles y estados de envío) sin cuentas ni productos de ejemplo; luego crea tu administrador con un hash propio. Ver [`database/README.md`](database/README.md).
2. **Backend:** carpeta `backend`, build `npm install`, start `npm start`, health check `/api/health`. Variables: `NODE_ENV=production`, `SESSION_SECRET` y los `DATABASE_*` (con `DATABASE_SSL=true` si aplica).
3. **Frontend:** carpeta `frontend`, build `npm install && npm run build`, start `node .output/server/index.mjs`. Variable `API_URL` con la URL del backend.
4. **Imágenes de productos:** se guardan en `backend/uploads/`. En Render el disco se borra en cada despliegue: usa un disco persistente o cambia `backend/src/utils/product-image.js` para subirlas a un servicio de imágenes.
5. El inicio de sesión del panel requiere **HTTPS** en producción (la cookie lleva el atributo `secure`).

## Más detalle

- Arquitectura por capas y lista completa de endpoints: [`backend/README.md`](backend/README.md)
- Modelo de datos, migraciones y cuentas de demostración: [`database/README.md`](database/README.md)
- Estructura del panel y de la tienda: [`frontend/README.md`](frontend/README.md)

## Estado y límites conocidos

- Blog, equipo, perfil y ajustes del panel se guardan en el navegador (`localStorage`); aún no tienen tablas.
- La tienda es HTML/JS con Vue por CDN; el panel es Nuxt. Unificarlas en una sola tecnología sería un trabajo aparte.
- La verificación OTP (`/auth/otp-verification`) del panel es solo una pantalla.
- Para recuperar contraseñas y verificar correos hace falta configurar el correo: el puente con Apps Script (`MAIL_RELAY_*`, lo más simple en Render gratis), la API de Gmail (`GMAIL_*`) o `SMTP_USER` y `SMTP_PASSWORD`.
