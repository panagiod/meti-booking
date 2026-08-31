<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cursor / agent guide — MeTi Pilates

## Read first

**[docs/PROJECT.md](docs/PROJECT.md)** — full project state, architecture, demo accounts, i18n, slot capacity, known issues.

## What this repo is

- **Public product:** MeTi Pilates — reformer-only studio booking (`src/lib/site-config.ts`)
- **Repo name:** `meti-booking` (legacy from Meti advisory marketplace)
- **Customer routes:** `/`, `/book`, `/login`, `/checkout`
- **Legacy routes:** `/services`, `/advisor/*`, `/admin/*`, LiveKit video — still in codebase

## Development workflow

- **Create a PR** for new work (don't commit directly to `main` unless explicitly asked).
- CI: `pnpm test:unit` + `pnpm test:e2e` on PRs.
- Prisma schema changes: `pnpm db:migrate` + regenerate client.
- After branding/copy changes: update `site-config.ts` + `src/i18n/locales/{en,el}.ts`.
- After demo seed changes: `pnpm demo:setup`.

## Common tasks

| Task | Where |
|------|-------|
| Studio name / capacity / images | `src/lib/site-config.ts` |
| Customer copy EN/EL | `src/i18n/locales/en.ts`, `el.ts` |
| Booking flow UI | `src/app/(marketing)/book/page.tsx` |
| Slot logic | `src/lib/slots.ts`, `src/app/api/slots/route.ts` |
| Booking creation | `src/app/api/appointments/route.ts` |
| Demo seed | `scripts/demo-setup.ts` |
| Public styles | `src/styles/studio.css` |

## Demo

```bash
pnpm demo:setup && pnpm dev
```

Password: `Demo1234!` — see [docs/DEMO.md](docs/DEMO.md).

## Do not assume

- Multiple session types (mat/duo/private) — **reformer only** on public site.
- README advisory marketplace description — outdated; use PROJECT.md.
- External image URLs — use `/public/images/`.
- Payments work on demo — MP not configured; Stripe planned.
