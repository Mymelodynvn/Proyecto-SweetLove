# Sweet Love Admin (back-sweetLove)

## Purpose

Admin dashboard for the Sweet Love handmade cakes site (frontend lives in `E:\WORK\Luewell\sweetLove\frontend`). Originally the free "Dasher" Bootstrap 5 admin template (Gulp + static HTML); being migrated to Nuxt 4 + shadcn-vue with a theme derived from the Sweet Love brand palette.

## Architecture

- Nuxt 4 app at the repository root (`app/` directory structure, TypeScript).
- UI components: shadcn-vue via the `shadcn-nuxt` module, generated into `app/components/ui/`.
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`), theme tokens as CSS variables in `app/assets/css/tailwind.css`.
- `legacy/` holds the original Dasher template (reference only, not built; do not modify).

## Brand palette (from frontend `style.css`)

- Cream background: `#FFFDEC`
- Green (primary actions): `#6C8D6F`, dark variant `#5D7B60`
- Pink (surfaces/accents): `#FFE2E2`
- Rose (accent text): `#C97B7B`

Theme maps these to shadcn tokens (OKLCH): green = `primary`, pink = `secondary`/`accent`, cream = light `background`. **Dark mode is the default** and uses neutral near-black surfaces (YouTube-style: bg 0.15, card 0.2, sidebar 0.18, zero chroma) with pink/green reserved for buttons, badges, and interactive accents. Theme selection persists in localStorage: an inline head script (nuxt.config.ts) applies it pre-paint, `plugins/theme.client.ts` syncs the state pre-mount, and app.vue binds the html class reactively via `useHead` — do NOT set a static `htmlAttrs.class`, hydration would override the saved choice. ApexCharts text/grid legibility comes from `use-chart-theme.ts` (foreColor/grid/tooltip per theme); every chart options object must be a computed that spreads it.

## Structure

- Collapsible sidebar + topbar layout (default layout). Sidebar groups: Panel, Tienda, Cuenta, Páginas.
- Dashboard (`/`): welcome banner, stat cards, revenue chart, product sales, orders table, top selling products.
- Store pages: `/products` (full CRUD: create/edit dialog, duplicate, delete with AlertDialog; status derived from stock in `use-products.ts`), `/orders` (status tabs filter, CSV export, detail dialog with status update), `/customers` (search, detail dialog with cross-referenced orders), `/blog` (create/edit dialog, publish/draft toggle, delete confirmation).
- Data layer: `use-persistent-state.ts` (generic useState + localStorage) backs `use-products`, `use-orders`, `use-blog-posts`, `use-profile`. Currency formatting via `app/utils/format-currency.ts` (COP).
- Product images: uploaded files are downscaled client-side to JPEG data URLs (`app/utils/read-image-file.ts`, limits in `lib/constants.ts`) so they fit in localStorage; the emoji is the fallback when `image` is null.
- Blog content is Markdown, rendered by `markdown-preview.vue` (marked + DOMPurify, client-only). Editing goes through `markdown-editor.vue`: a reusable v-model component with a formatting toolbar (bold/italic/strike, H2/H3, lists, quote, code, link operating on the textarea selection) plus write/preview tabs; each card opens a read dialog.
- Encoding gotcha: NEVER edit source files via PowerShell `Get-Content`/`Set-Content` — PowerShell 5.1 misreads BOM-less UTF-8 and mangles emojis/accents. Use proper file tools.
- AlertDialog gotcha: do NOT drive its `open` from the pending-item ref and clear that ref in `@update:open` — reka closes the dialog before the action's `@click` runs, so the handler sees null. Keep a separate `isDeleteDialogOpen` ref.
- `/reports`: sales reports (6 KPIs; revenue bar chart driven by a period select with today/week/6m/12m buckets; category, channels donuts; new-vs-returning customers area; orders-by-status and weekday bars; top customers table; CSV export via `app/utils/download-csv.ts`).
- `/highlights` ("Destacados"): customer ranking (VIP/recurring/new KPIs + spending ranking with medals) and product ranking (best rated podium + best sellers), tabs-based. Customer data lives in `use-customers.ts` (shared with `/customers`; `totalSpent` is a number formatted with `formatCop`).
- Active tabs use the brand green (`data-active:bg-primary` in `ui/tabs/TabsTrigger.vue`); the dashboard revenue selector overrides it with a softer `bg-primary/15 + border-primary/50` tint.
- Topbar notifications live in `app-notifications.vue` (local mock state: unread badge, mark-as-read, mark-all).
- Account pages: `/profile` (founder profile mirroring the frontend "Sobre Nosotros" section; editable via dialog, state in `use-profile.ts` persisted to localStorage and shared with the sidebar footer and topbar user menu), `/team` (team management: roles + per-user permission overrides from `use-team.ts` — Administrador/Gerente/Vendedor/Repostero over 8 permission keys; add/edit/preview/deactivate/delete members; the seeded owner is protected from deletion/deactivation and role change), `/settings` (store info, notifications, security tabs; dark-theme switch wired to `use-theme-mode`).
- Auth pages (`auth` layout, no sidebar): sign-in, sign-up, forgot-password, reset-password, otp-verification.
- Error pages: 404 (`/error/not-found` + global `error.vue`), maintenance.
- All list pages use in-file mock data (Spanish, bakery-themed); no API wiring yet.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — production build
- `pnpm dlx shadcn-vue@latest add <component>` — add a shadcn component

## Environment requirements

- Node.js 22+ required (Nuxt 4.5/Vite 8 and the shadcn-vue CLI fail on Node 20). The machine's default nvm version is 20.19; use `nvm use 22.16.0` or prefix PATH with `C:\Users\User\AppData\Local\nvm\v22.16.0`.
- TypeScript must stay on 5.x: `@vue/compiler-sfc` resolves imported prop types through the TypeScript JS API, which `typescript@7` (native) does not provide — installing 7.x breaks `pnpm build`.
- `packageManager: pnpm@10.15.1` is pinned so the shadcn CLI's internal `corepack pnpm` calls match the store layout of the local pnpm.
- The shadcn-vue CLI init does NOT write the `@custom-variant` definitions its components rely on (`data-horizontal`, `data-vertical`, `data-open`, `data-closed`, `data-checked`, `data-unchecked`). They are defined manually in `app/assets/css/tailwind.css`; without them, Tabs render side-by-side and Switch backgrounds are transparent. If a newly added component looks broken, check whether it uses another `data-*` shorthand variant that needs defining there.

## Conventions

- Package manager: pnpm only.
- Source code, identifiers, and comments in English; user-facing admin copy in Spanish (matches the Sweet Love site).
- New files/directories in kebab-case.
- Formatting (user preference): leave one blank line between sibling child elements in HTML/Vue templates, and one blank line before `return` statements in JS/TS (when the return follows other statements). Apply to new and edited code.
