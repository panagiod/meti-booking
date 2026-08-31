<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cursor / agent guide — MeTi Pilates

## Read first

| Doc | Contents |
|-----|----------|
| **[docs/PROJECT.md](docs/PROJECT.md)** | Architecture, APIs, DB, i18n, demo, security |
| **[docs/ADMIN.md](docs/ADMIN.md)** | Admin calendar + website CMS |

## What this repo is

- **Public product:** MeTi Pilates — reformer-only studio booking
- **Repo name:** `meti-booking` (legacy Meti advisory marketplace)
- **Customer routes:** `/`, `/book`, `/login`, `/checkout`
- **Admin (MeTi):** `/admin/schedule`, `/admin/content`
- **Currency:** EUR · **Timezone:** Europe/Athens · **Booking window:** 8 weeks
- **Legacy:** `/services`, `/advisor/*`, LiveKit video

## Development workflow

- PRs preferred; CI runs `pnpm test:unit` + `pnpm test:e2e`
- Schema changes: `pnpm db:migrate` + update `demo-setup.ts`
- After seed changes: `pnpm demo:setup`
- Production: set `ENCRYPTION_KEY`, `STUDIO_TIMEZONE`, `BLOB_READ_WRITE_TOKEN`

## Common tasks

| Task | Where |
|------|-------|
| **Live homepage copy/images** | Admin `/admin/content` → DB `studio_content` |
| **Code copy defaults** | `src/i18n/locales/en.ts`, `el.ts` |
| **Live booking schedule** | Admin `/admin/schedule` → `advisor_schedule` |
| **Schedule code defaults** | `src/lib/studio-schedule.ts`, `demo-setup.ts` |
| Slot capacity / booking window | `src/lib/site-config.ts` |
| Timezone / slot times | `src/lib/timezone.ts` |
| Greek date formatting | `src/lib/date-locale.ts` |
| Booking UI | `src/app/(marketing)/book/page.tsx` |
| Slot logic + validation | `src/lib/slots.ts`, `src/lib/slot-booking.ts` |
| Lead time / pricing | `src/lib/booking-config.ts`, `src/app/api/checkout/quote/route.ts` |
| Auth middleware | `src/proxy.ts` (keep public APIs allowlisted) |
| Admin auth | `src/lib/admin-auth.ts`, `admin/layout.tsx` |
| MP encryption | `src/lib/encryption.ts`, `src/lib/advisor-mp.ts` |
| Checkout pricing | `src/app/api/checkout/quote/route.ts` |

## Demo

```bash
pnpm demo:setup && pnpm dev
```

Password: `Demo1234!` locally — admin: `admin@demo.meti-booking.local`

Flags: `--reset` (schedule), `--reset-content` (CMS)

Close fixed audit issues: `./scripts/close-resolved-issues.sh`

## Do not assume

- Multiple session types on public site — **reformer only**
- Copy only in locale files — **admin CMS overrides DB**
- Tue/Thu/Sat schedule — demo seed is **Mon/Wed/Sat**
- COP currency — everything is **EUR**
- Colombia timezone — use **Europe/Athens** via `timezone.ts`
- Greek genitive months — use **nominative** via `date-locale.ts`
- `bookingLeadHours` default is **2h** — use `resolveBookingLeadHours()`
- Hardcoded fees — use **`GET /api/checkout/quote`**
- `/api/advisors` needs auth — must be **public** for `/book`
- Payments work — MP not configured on demo; Stripe planned
- External image URLs — use `/public/images/` or admin upload
