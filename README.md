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
- Cuentas de demostración (de `database/seed.sql`), contraseña `SweetLove#2026`: `carlos@gmail.com` (administrador), `laura@gmail.com` (cliente). **Cámbialas o elimínalas antes de publicar.**

## Comandos útiles

Se ejecutan dentro de la carpeta indicada.

| Carpeta | Comando | Qué hace |
|---|---|---|
| `backend/` | `npm test` | Pruebas del backend (no necesitan MySQL) |
| `backend/` | `npm run db:init` | Crea la base con esquema y datos de demostración |
| `backend/` | `npm run db:migrate` | Aplica migraciones pendientes a una base existente |
| `backend/` | `npm run db:status` | Muestra el estado de las migraciones |
| `backend/` | `npm run db:baseline -- 001` | Registra como aplicadas migraciones que ya hiciste a mano |
| `frontend/` | `npm run build` | Compila el frontend para producción |

## Variables de entorno

**Backend** (`backend/.env`):

| Variable | Para qué |
|---|---|
| `SESSION_SECRET` | Firma la cookie de sesión. **Obligatoria**, mínimo 32 caracteres. Genera una con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Conexión a MySQL |
| `DATABASE_SSL` | `true` si la base es de un proveedor en la nube que exige conexión cifrada (TiDB Cloud, Aiven…); `false` con XAMPP |
| `PORT` | Puerto de la API (por defecto 4000) |
| `CORS_ORIGIN` | Orígenes extra permitidos, separados por coma. Vacío si el frontend usa el proxy (lo normal) |

**Frontend** (`frontend/.env`): `API_URL`, la dirección del backend. Se lee al **construir**; si la cambias, vuelve a construir.

## Seguridad

- Contraseñas con **bcrypt**; sesión en cookie **firmada y httpOnly** (8 h), con atributo `secure` en producción.
- Todas las rutas del panel exigen rol Administrador en el backend; el rol se consulta a la base en cada petición.
- Límite de intentos de login y registro (20 por 15 minutos por IP).
- El checkout calcula los precios en el servidor, dentro de una transacción con bloqueo de stock.

## Publicar (por ejemplo en Render)

Dos servicios Node más una base MySQL:

1. **Base de datos:** una MySQL externa (Render no ofrece MySQL gestionado). Aplica solo `database/schema.sql` (sin datos de demostración) y crea tu administrador con un hash propio; ver [`database/README.md`](database/README.md).
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
- La recuperación de contraseña y la verificación OTP son solo pantallas.
- El checkout de la tienda pide los datos con ventanas emergentes del navegador.
