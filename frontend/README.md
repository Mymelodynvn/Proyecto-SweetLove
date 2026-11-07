# Frontend — panel y tienda de Sweet Love

Un solo proyecto con las dos interfaces:

- **Panel de administración** — Nuxt 4 (Vue 3), Tailwind CSS 4 y shadcn-vue. Rutas: `/admin`, `/products`, `/orders`…
- **Tienda pública** — HTML, CSS y JavaScript (Vue por CDN) en [`public/tienda/`](public/tienda/). Ruta: `/tienda/index.html` (la raíz `/` redirige aquí).

No contiene SQL ni reglas de negocio: todo lo pide al backend por `/api/*`.

## Ejecutar

```bash
npm install
cp .env.example .env     # API_URL=http://localhost:4000
npm run dev              # http://localhost:3000   (el backend debe estar corriendo)
```

`nuxt.config.ts` reenvía `/api/**` y `/uploads/**` al backend (`API_URL`). El navegador solo ve un origen,
por eso la cookie de sesión funciona sin configurar CORS. `API_URL` se lee al **construir**.

## Estructura

```
app.vue, error.vue        raíz y pantalla de error
layouts/                  default (panel con menú) y auth (pantallas de acceso)
pages/                    una carpeta por módulo del panel
components/               app-sidebar, app-topbar… y ui/ (biblioteca shadcn-vue, generada)
composables/              estado y llamadas a la API (use-products, use-orders, useAuth…)
middleware/auth.global.ts guardia: sin administrador → /auth/sign-in
plugins/, utils/, lib/    gráficas, tema, formatos y constantes
public/tienda/            tienda pública (js/ = estado, componentes y carrito)
```

## Datos del panel y de dónde salen

| Módulo | Fuente |
|---|---|
| Dashboard, productos, pedidos, clientes, pagos, envíos, proveedores, novedades (mensajes de contacto), reportes | API → MySQL |
| Blog, lista del equipo, perfil, ajustes | `localStorage` del navegador (aún sin tablas) |
| Cuentas de los administradores del equipo | API → MySQL: al agregar a alguien con rol Administrador se crea su cuenta (o se convierte la de tienda) y al quitarlo o suspenderlo pierde el acceso |

## Comandos

`npm run dev` · `npm run build` · `npm run preview`
