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
| **[docs/HOSTING.md](docs/HOSTING.md)** | Production hosting (Hetzner VPS recommended) |

## What this repo is

- **Public product:** MeTi Pilates — reformer-only studio booking
- **Repo name:** `meti-booking` (legacy Meti advisory marketplace)
- **Customer routes:** `/`, `/book`, `/login`, `/checkout`, `/dashboard`
- **Admin (MeTi):** `/admin`, `/admin/bookings`, `/admin/users`, `/admin/schedule`, `/admin/closures`, `/admin/content`
- **Language:** Greek by default (`ΕΛ`). Cookie `meti-lang`. EN is optional.
- **Currency:** EUR · **Timezone:** Asia/Nicosia · **Booking window:** 8 weeks
- **Legacy:** `/services`, `/advisor/*`, LiveKit video

## Development workflow

- PRs preferred; CI runs `pnpm test:unit` + `pnpm test:e2e`
- Schema changes: `pnpm db:migrate` + update `demo-setup.ts`
- After seed changes: `pnpm demo:setup`
- Production: set `ENCRYPTION_KEY`, `STUDIO_TIMEZONE`, `CRON_SECRET`
- **Private ops repo:** encrypted DB + `.env` backups. Public pointer: [deploy/OPS.md](deploy/OPS.md). Host-specific runbooks are **not** in this repo.
- **If production data is lost, follow Disaster recovery below** — do not invent a new restore path
- **If you change backup or restore, update the private ops runbooks** (`docs/OPS.md`, `docs/BACKUP.md`, `docs/RECOVERY.md`) and the public-safe skill [`.agents/skills/meti-backup-restore/SKILL.md`](.agents/skills/meti-backup-restore/SKILL.md). Do not write the host IP or the ops repo name into this public tree.
- **Hetzner VPS:** `SELF_HOSTED=1`, use `./deploy/deploy.sh` — see [docs/HOSTING.md](docs/HOSTING.md)
- **Vercel:** `BLOB_READ_WRITE_TOKEN` for admin uploads

## Common tasks

| Task | Where |
|------|-------|
| **Live homepage copy/images** | Admin `/admin/content` → DB `studio_content` |
| **Code copy defaults** | `src/i18n/locales/en.ts`, `el.ts` |
| **Live booking schedule** | Admin `/admin/schedule` (hours) + `/admin/closures` (days off) → `advisor_schedule` |
| **Schedule code defaults** | `src/lib/studio-schedule.ts`, `demo-setup.ts` |
| Slot capacity / booking window | `src/lib/site-config.ts` |
| Timezone / slot times | `src/lib/timezone.ts` |
| Greek date formatting | `src/lib/date-locale.ts` (genitive with a day: 3 Σεπτεμβρίου) |
| Phone at booking | `src/lib/client-phone.ts` |
| Booking UI | `src/app/(marketing)/book/page.tsx` |
| Slot logic + validation | `src/lib/slots.ts`, `src/lib/slot-booking.ts` |
| Lead time / pricing | `src/lib/booking-config.ts`, `src/app/api/checkout/quote/route.ts` |
| Auth middleware | `src/proxy.ts` (keep public APIs allowlisted) |
| Admin auth | `src/lib/admin-auth.ts`, `admin/layout.tsx` |
| MP encryption | `src/lib/encryption.ts`, `src/lib/advisor-mp.ts` |
| Checkout pricing | `src/app/api/checkout/quote/route.ts` |
| **Production deploy** | `deploy/HETZNER.md`, `docs/HOSTING.md` |
| **Backup / restore** | [deploy/OPS.md](deploy/OPS.md) (public pointer) · private repo `docs/` · skill [meti-backup-restore](.agents/skills/meti-backup-restore/SKILL.md) |
| **Downtime / usage alerts** | GitHub **Uptime** + VPS cron (`deploy/monitor-studio.sh`) |

## Disaster recovery

Host-specific steps (SSH, host address, private repo name) live in the private
ops repo: `docs/RECOVERY.md` and `docs/OPS.md`. Public pointer:
[deploy/OPS.md](deploy/OPS.md). Agent skill:
[`.agents/skills/meti-backup-restore/SKILL.md`](.agents/skills/meti-backup-restore/SKILL.md).

**Test without replacing live data:** Actions → **Backup Production**, then **Verify Restore**.

**Live dress rehearsal:** Actions → **Backup and Restore** → type `RESTORE`. Brief downtime. Rolls back if `/api/health` fails.

**Same VPS (database wiped or bad deploy):** Actions → **Restore Production** → backup `latest` → type `RESTORE`.

**VPS destroyed (new machine):** Actions → **Rebuild Production** → type `REBUILD`. Then point DNS at the new host and re-run `./deploy/setup-cicd.sh`.

Do not `--force-reset` or cancel upcoming bookings. Do not commit plaintext `.env` or `data.db`. Do not publish the production host or the private ops repo name here.

## Alerts

- **On the VPS every 15 min:** `deploy/monitor-studio.sh` emails `STUDIO_NOTIFICATION_EMAIL` for downtime (systemd, `/`, `/book`, `/api/health`) and high usage (disk 80%, RAM 88%, load 1.5× CPUs, next 14 days 80% full). Debounced 6 hours; one recovery email.
- **From GitHub every 15 min:** Actions → **Uptime** hits the public site. This still runs if the VPS is dead. Email only if `RESEND_API_KEY` is a GitHub secret.

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
- Tue/Thu/Sat schedule — demo seed is **Tue/Thu 15:45–18:00, Sat 08:00–12:45**
- COP currency — everything is **EUR**
- Colombia timezone — use **Nicosia, Cyprus** (`Asia/Nicosia`) via `timezone.ts`
- Greek dates without a day — nominative month (`Σεπτέμβριος 2026`); **with a day use genitive** (`3 Σεπτεμβρίου`)
- Site language defaults to **Greek** (`meti-lang`); do not assume English
- Production host / private ops repo name belong in the **private** ops docs — do not put them in this public repo
- Admin UI is translated — keys in `src/i18n/locales/{en,el}.ts` under `admin`
- `bookingLeadHours` default is **2h** — use `resolveBookingLeadHours()`
- Hardcoded fees — use **`GET /api/checkout/quote`**
- `/api/advisors` needs auth — must be **public** for `/book`
- Payments work — MP not configured on demo; Stripe planned
- External image URLs — use `/public/images/` or admin upload
