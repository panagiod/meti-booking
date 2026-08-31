<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cursor / agent guide — MeTi Pilates

## Read first

| Doc | Contents |
|-----|----------|
| **[docs/PROJECT.md](docs/PROJECT.md)** | Architecture, APIs, DB, i18n, demo |
| **[docs/ADMIN.md](docs/ADMIN.md)** | Admin calendar + website CMS |

## What this repo is

- **Public product:** MeTi Pilates — reformer-only studio booking
- **Repo name:** `meti-booking` (legacy Meti advisory marketplace)
- **Customer routes:** `/`, `/book`, `/login`, `/checkout`
- **Admin (MeTi):** `/admin/schedule`, `/admin/content`
- **Legacy:** `/services`, `/advisor/*`, LiveKit video

## Development workflow

- PRs preferred; CI runs `pnpm test:unit` + `pnpm test:e2e`
- Schema changes: `pnpm db:migrate` + update `demo-setup.ts`
- After seed changes: `pnpm demo:setup`

## Common tasks

| Task | Where |
|------|-------|
| **Live homepage copy/images** | Admin `/admin/content` → DB `studio_content` |
| **Code copy defaults** | `src/i18n/locales/en.ts`, `el.ts` |
| **Live booking schedule** | Admin `/admin/schedule` → `advisor_schedule` |
| **Schedule code defaults** | `src/lib/studio-schedule.ts`, `demo-setup.ts` |
| Slot capacity | `src/lib/site-config.ts` (`slotCapacity: 3`) |
| Booking UI | `src/app/(marketing)/book/page.tsx` |
| Slot logic | `src/lib/slots.ts`, `src/app/api/slots/route.ts` |
| CMS server logic | `src/lib/studio-content-server.ts` |
| Greek fonts | `src/app/layout.tsx` + `src/styles/studio.css` |
| OG / favicons | `src/app/opengraph-image.tsx`, `scripts/generate-brand-assets.ts` |

## Demo

```bash
pnpm demo:setup && pnpm dev
```

Password: `Demo1234!` — admin: `admin@demo.meti-booking.local`

## Do not assume

- Multiple session types on public site — **reformer only**
- Copy only in locale files — **admin CMS overrides DB**
- Mon–Fri full-day schedule — **3 afternoons/week default**
- Payments work — MP not configured; Stripe planned
- External image URLs — use `/public/images/` or admin upload
