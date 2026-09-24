# Sweet Love Admin

Admin dashboard for the Sweet Love handmade cakes site, built with Nuxt 4, shadcn-vue, and Tailwind CSS v4. The theme is derived from the Sweet Love brand palette (pink `#FFE2E2`, rose `#C97B7B`, green `#6C8D6F`, cream `#FFFDEC`).

## Requirements

- Node.js 22+ (`nvm use 22.16.0`)
- pnpm 10

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Production

```bash
pnpm build
node .output/server/index.mjs
```

## Adding shadcn-vue components

```bash
pnpm dlx shadcn-vue@latest add <component>
```

Components are generated into `app/components/ui/`.

## Legacy template

The original Dasher (Bootstrap 5 + Gulp) template this admin was migrated from is archived in `legacy/` for reference only.
