# Base de datos

MySQL 8 (o compatible: MariaDB, TiDB), juego de caracteres `utf8mb4`. Base por defecto: `sweetlove`.
Los scripts se gestionan con el ejecutor del backend (`backend/scripts/db.js`), no a mano.

| Archivo | Uso |
|---|---|
| `schema.sql` | Estructura de las tablas (**borra y recrea**) |
| `seed.sql` | Datos de demostración (no usar en producción) |
| `migrations/NNN_nombre.sql` | Cambios numerados para bases que ya existen |

## Modelo

```
rol 1 ───< usuario 1 ───< pedido 1 ───< itempedido >─── 1 producto >─── 1 proveedor
                                │
                                └──< pago 1 ───< envio >─── 1 estadoenvio
```

| Tabla | Para qué sirve |
|---|---|
| `rol` | Administrador (1), Cliente (2), Proveedor (3) |
| `usuario` | Personas con acceso o que compraron. `email` único; `contrasena` guarda el hash bcrypt |
| `proveedor` | Quién abastece los productos |
| `producto` | Catálogo: precio, stock (`cantidad`), `imagen` (ruta), `estado` (activo) |
| `pedido` | Cabecera de una compra: total, fecha, `estadoPedido`, cliente (`idUser`) |
| `itempedido` | Una línea por producto del pedido, con el precio unitario del momento de la compra |
| `pago` | Pago de un pedido: medio, monto, `estadoPago` |
| `estadoenvio` / `envio` | Estados de envío (Pendiente, En camino, Entregado) y el envío asociado a un pago |
| `schema_migrations` | Control de migraciones aplicadas (la crea el ejecutor) |

Un pedido puede tener varios productos. Los modelos antiguos con `pedido.idItem` o `itempedido.idUser` ya no existen
(ver `migrations/001_pedidos_normalizados.sql`).

## Comandos (dentro de la carpeta `backend/`)

| Comando | Qué hace |
|---|---|
| `npm run db:init` | Crea la base, aplica `schema.sql` y `seed.sql` y marca las migraciones como aplicadas. **Se niega si ya hay tablas**; para recrearla (borra los datos): `npm run db:init -- --force` |
| `npm run db:migrate` | Aplica las migraciones que falten, en orden |
| `npm run db:status` | Lista migraciones aplicadas y pendientes |
| `npm run db:baseline -- 001` | Registra como aplicadas las migraciones hasta ese número, sin ejecutarlas |

Usan las variables `DATABASE_*` de `backend/.env` (con `DATABASE_SSL=true` si la base está en la nube).

## Bases que ya existen

Si ya tienes una base en uso (por ejemplo la de XAMPP), **no ejecutes `db:init`**: la borraría. Según su estado:

| Tu base… | Qué hacer |
|---|---|
| Ya usa el modelo normalizado (`pedido.idUser`) pero guarda contraseñas `1234` | `npm run db:baseline -- 001` y luego `npm run db:migrate` (aplica `002`, que las convierte a hash; la clave nueva es `SweetLove#2026`) |
| Todavía usa el modelo antiguo (`pedido.idItem`) | `npm run db:migrate` (aplica `001` y `002`). Haz un respaldo antes |
| Ya está totalmente al día | `npm run db:baseline -- 002` para que quede registrada |

Comprueba el resultado con `npm run db:status`.

## Cómo agregar un cambio de esquema

1. Crea `migrations/003_descripcion.sql` con el `ALTER`/`CREATE` necesario.
2. Aplica el mismo cambio en `schema.sql`, para que las bases nuevas nazcan igual.
3. En cada base existente: `npm run db:migrate`.

## Cuentas de demostración

`seed.sql` crea tres usuarios con contraseña `SweetLove#2026`: `carlos@gmail.com` (Administrador),
`laura@gmail.com` (Cliente) y `ana@gmail.com` (Proveedor). **No los uses en producción.** Para una base real,
aplica solo `schema.sql` y crea el administrador con un hash propio:
`node -e "console.log(require('bcryptjs').hashSync('TU_CLAVE', 10))"` (dentro de `backend/`).

## Bases en la nube (TiDB Cloud, Aiven…)

Funciona igual que XAMPP; solo cambia `backend/.env` (host, usuario, contraseña y `DATABASE_SSL=true`).
Crea una base propia (por ejemplo `sweetlove`); no uses bases de sistema como `sys` o `mysql`.
Probado con TiDB Cloud Serverless: los identificadores autoincrementales pueden saltar (1, 2, 30001…); es normal.
