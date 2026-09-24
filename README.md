# Sweet Love

Proyecto integrado de Sweet Love con tres partes principales:

- `back-sweetLove/back-sweetLove`: administrador Nuxt, API y conexión MySQL.
- `back-sweetLove/back-sweetLove/public/front`: frontend público original HTML/CSS/JavaScript.
- `sweetLove/frontend` y `sweetLove/backend`: copias originales de referencia conservadas para consulta.
- `database/`: esquema normalizado y scripts de migración.
- `docs/`: explicación de arquitectura, base de datos, API y archivos.

## Ejecutar el administrador

1. Enciende Apache y MySQL en XAMPP.
2. Mantén la base `sweetlove` con el modelo normalizado ya aplicado.
3. Entra a `back-sweetLove/back-sweetLove`.
4. Crea `.env` a partir de `.env.example`.
5. Ejecuta `pnpm install`.
6. Ejecuta `pnpm dev`.
7. Abre `http://localhost:3000/`.

## Frontend público

Con el administrador ejecutándose, abre `http://localhost:3000/front/index.html`. El frontend carga los productos desde `/api/products` y registra los pedidos mediante `/api/orders`.

## Base de datos

Si tu base ya fue migrada al modelo normalizado, no vuelvas a ejecutar la migración de pedidos. La migración de imágenes ya no es necesaria: las imágenes cargadas se guardan como archivos en `public/uploads/products` y MySQL conserva la ruta.

Consulta `docs/COMO-EJECUTAR.md` y `docs/EXPLICACION-ARCHIVO-POR-ARCHIVO.md` para más detalles.
