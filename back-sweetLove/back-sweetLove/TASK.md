# TASK: Migrate Dasher admin to Nuxt 4 + shadcn-vue with Sweet Love theme

## Objective

Make the admin run on Nuxt, add shadcn-vue components, adapt the shadcn design to the existing admin structure (sidebar + topbar + dashboard + auth + error pages), and theme it with the Sweet Love frontend palette (pink `#FFE2E2`/`#C97B7B`, green `#6C8D6F`/`#5D7B60`, cream `#FFFDEC`).

## Constraints

- pnpm only; official scaffolding commands.
- Keep the original template as reference in `legacy/`.
- Node 22 required at runtime/build time (see AGENTS.md, "Environment requirements").

## Phases

1. [done] Analysis: template structure + frontend palette extracted.
2. [done] Scaffold: legacy files moved to `legacy/`, Nuxt 4.5.2 created at repo root (`pnpm create nuxt@latest . --template minimal`).
3. [done] shadcn: Tailwind v4 + shadcn-nuxt module + init (base reka, style vega, tabler icons) + 21 components added.
4. [done] Theme: Sweet Love palette mapped to shadcn CSS variables in `app/assets/css/tailwind.css` (light + dark, OKLCH).
5. [done] Layouts & pages: default layout (sidebar + topbar), auth layout, dashboard, 5 auth pages, 404/maintenance, blank, global error.vue.
6. [done] Verification: `pnpm build` passes; all routes return 200 via built server; unknown route renders themed 404; brand tokens present in built CSS.

## Status / next step

Complete. Store/account views have working CRUD with localStorage persistence: products (create/edit/duplicate/delete), orders (detail + status update), blog (create/edit/publish/delete), customers (detail with cross-referenced orders), profile (edit dialog). Possible follow-ups: real API wiring (replace the `use-persistent-state` composables), authentication logic, image upload for products.

## Decisions

- Nuxt app lives at repo root; old Gulp template moved to `legacy/` (root `package.json` conflict).
- Charts: apexcharts + vue3-apexcharts (matches original template's charting), registered via `app/plugins/apexcharts.client.ts` and rendered inside `<ClientOnly>`.
- Admin UI copy in Spanish to match the Sweet Love site.
- TypeScript pinned to 5.x (7.x native breaks `@vue/compiler-sfc` type resolution).
- Dark mode via `.dark` class toggle composable (`use-theme-mode.ts`), persisted in localStorage. Dark is the default theme (SSR renders `<html class="dark">`); light is opt-in via the topbar toggle.

## Verification results

- `pnpm build` (Node 22.16): success, client + server + nitro bundles generated.
- HTTP smoke test on built server: `/`, 5 auth routes, `/blank`, `/error/maintenance`, `/error/not-found` → 200; `/no-existe` → 404 (error.vue).
- SSR HTML contains sidebar, dashboard cards, and Spanish copy; built CSS contains brand OKLCH tokens.
