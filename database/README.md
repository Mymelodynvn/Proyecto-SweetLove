# Base de datos

MySQL 8 (o compatible: MariaDB, TiDB), juego de caracteres `utf8mb4`. Base por defecto: `sweetlove`.
Los scripts se gestionan con el ejecutor del backend (`backend/scripts/db.js`), no a mano.

| Archivo | Uso | ¿Producción? |
|---|---|---|
| `schema.sql` | Estructura de las 10 tablas (**borra y recrea**) | Sí |
| `datos-base.sql` | Los roles y los estados de envío, que el sistema necesita siempre | Sí |
| `seed.sql` | Datos de demostración: 6 cuentas, 24 productos y 10 pedidos | **No** |
| `migrations/NNN_nombre.sql` | Cambios numerados para bases que ya existen | Sí, si ya tienes datos |

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
| `producto` | Catálogo: precio, stock (`cantidad`), `imagen` (archivo propio o URL), `estado` (activo) |
| `pedido` | Cabecera de una compra: total, fecha, `estadoPedido`, cliente (`idUser`) y datos de entrega propios del pedido |
| `itempedido` | Una línea por producto del pedido, con el precio unitario del momento de la compra |
| `pago` | Pago de un pedido: medio, monto, `estadoPago` |
| `estadoenvio` / `envio` | Estados de envío (Pendiente, En camino, Entregado) y el envío asociado a un pago |
| `token_cuenta` | Enlaces de un solo uso (verificar correo, restablecer contraseña); guarda solo el hash |
| `schema_migrations` | Control de migraciones aplicadas (la crea el ejecutor) |

Un pedido puede tener varios productos. `usuario` lleva `emailVerificado` y `esInvitado` (compras sin cuenta), y `pedido` guarda la hora de creación y la entrega (`nombreEnvio`, `celularEnvio`, `direccionEnvio`).

## Comandos (dentro de la carpeta `backend/`)

| Comando | Qué hace |
|---|---|
| `npm run db:init` | Crea la base y carga `schema.sql`, `datos-base.sql` y `seed.sql`. **Se niega si ya hay tablas**; para recrearla (borra los datos): `npm run db:init -- --force` |
| `npm run db:init -- --sin-demo` | Igual, pero **sin** `seed.sql`: queda una base limpia lista para producción (solo roles y estados de envío) |
| `npm run db:migrate` | Aplica las migraciones que falten, en orden |
| `npm run db:status` | Lista migraciones aplicadas y pendientes |
| `npm run db:baseline -- 003` | Registra como aplicadas las migraciones hasta ese número, sin ejecutarlas |

Se pueden combinar: `npm run db:init -- --force --sin-demo`. Usan las variables `DATABASE_*` de `backend/.env` (con `DATABASE_SSL=true` si la base está en la nube).

## Datos de demostración

`seed.sql` crea seis cuentas (correos y contraseña en el comentario al inicio del archivo). Los correos usan `example.com` (dominio reservado para ejemplos), así que «Olvidé mi contraseña» nunca escribe a una persona real:

| Rol | Qué muestra |
|---|---|
| Administrador | Entra al panel |
| Cliente | 6 pedidos: nivel VIP |
| Cliente | 2 pedidos: nivel Frecuente |
| Cliente | 1 pedido con el pago en proceso: nivel Nuevo |
| Cliente | 1 pedido cancelado: nivel Nuevo |
| Proveedor | Dueña del proveedor «Dulces del Valle» |

Los 10 pedidos cubren todos los estados (Pendiente, En preparación, Enviado, Completado y Cancelado), todos con Mercado Pago y con los datos de entrega. Sus fechas son relativas al día en que se carga el archivo, y ninguno vence solo. Los 10 primeros productos usan las fotos propias de la tienda; el resto enlaza fotos de Wikimedia Commons.

## Una base real (producción)

No cargues `seed.sql`. Crea la base limpia y agrega tu administrador:

```bash
cd backend
npm run db:init -- --sin-demo
node -e "console.log(require('bcryptjs').hashSync('TuContrasena1!', 10))"    # 8-16 caracteres, con letra, número y carácter especial (@ # $ ! ? * .), sin espacios ni < ni >
```

```sql
INSERT INTO usuario (nombre, apellido, email, celular, direccion, contrasena, idRol, emailVerificado, esInvitado)
VALUES ('Nombre', 'Apellido', 'admin@sunegocio.com', '3000000000', 'Ciudad', '<HASH_BCRYPT>', 1, 1, 0);
```

## Bases que ya existen

Si ya tienes una base en uso, **no ejecutes `db:init`**: la borraría. Las migraciones antiguas (el paso del modelo viejo de pedidos y el cambio de contraseñas de ejemplo) se retiraron porque ninguna base actual las necesita. Si tu base ya tiene las columnas de la migración `003`, ejecuta `npm run db:baseline -- 003`; si no, `npm run db:migrate` la aplica. Comprueba el resultado con `npm run db:status`.

## Cómo agregar un cambio de esquema

1. Crea `migrations/004_descripcion.sql` con el `ALTER`/`CREATE` necesario.
2. Aplica el mismo cambio en `schema.sql`, para que las bases nuevas nazcan igual.
3. En cada base existente: `npm run db:migrate`.

## Bases en la nube (TiDB Cloud, Aiven…)

Funciona igual que XAMPP; solo cambia `backend/.env` (host, usuario, contraseña y `DATABASE_SSL=true`).
Crea una base propia (por ejemplo `sweetlove`); no uses bases de sistema como `sys` o `mysql`.
Probado con TiDB Cloud Serverless: los identificadores autoincrementales pueden saltar (1, 2, 30001…); es normal.
