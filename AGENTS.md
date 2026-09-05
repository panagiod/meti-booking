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
- **Customer routes:** `/`, `/book`, `/login`, `/checkout`
- **Admin (MeTi):** `/admin`, `/admin/bookings`, `/admin/users`, `/admin/schedule`, `/admin/closures`, `/admin/content`
- **Currency:** EUR · **Timezone:** Asia/Nicosia · **Booking window:** 8 weeks
- **Legacy:** `/services`, `/advisor/*`, LiveKit video

## Development workflow

- PRs preferred; CI runs `pnpm test:unit` + `pnpm test:e2e`
- Schema changes: `pnpm db:migrate` + update `demo-setup.ts`
- After seed changes: `pnpm demo:setup`
- Production: set `ENCRYPTION_KEY`, `STUDIO_TIMEZONE`, `CRON_SECRET`
- **Private ops repo:** encrypted DB + `.env` backups — [deploy/OPS.md](deploy/OPS.md)
- **If production data is lost, follow Disaster recovery below** — do not invent a new restore path
- **If you change backup or restore, update the procedures in the same change** — [deploy/OPS.md](deploy/OPS.md), [deploy/BACKUP.md](deploy/BACKUP.md), this Disaster recovery section, and [`.agents/skills/meti-backup-restore/SKILL.md`](.agents/skills/meti-backup-restore/SKILL.md). Do not leave the runbooks describing an old path.
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
| Greek date formatting | `src/lib/date-locale.ts` |
| Booking UI | `src/app/(marketing)/book/page.tsx` |
| Slot logic + validation | `src/lib/slots.ts`, `src/lib/slot-booking.ts` |
| Lead time / pricing | `src/lib/booking-config.ts`, `src/app/api/checkout/quote/route.ts` |
| Auth middleware | `src/proxy.ts` (keep public APIs allowlisted) |
| Admin auth | `src/lib/admin-auth.ts`, `admin/layout.tsx` |
| MP encryption | `src/lib/encryption.ts`, `src/lib/advisor-mp.ts` |
| Checkout pricing | `src/app/api/checkout/quote/route.ts` |
| **Production deploy** | `deploy/HETZNER.md`, `docs/HOSTING.md` |
| **Backup / restore** | [deploy/OPS.md](deploy/OPS.md), skill [meti-backup-restore](.agents/skills/meti-backup-restore/SKILL.md) |
| **Downtime / usage alerts** | [deploy/OPS.md](deploy/OPS.md) — VPS cron + GitHub **Uptime** |

## Disaster recovery

Full runbook: **[deploy/OPS.md](deploy/OPS.md)**. Private vault: `panagiod/meti-studio-ops`. Agent skill: [`.agents/skills/meti-backup-restore/SKILL.md`](.agents/skills/meti-backup-restore/SKILL.md).

Any change that affects encrypting, publishing, verifying, restoring, or rebuilding studio data must update those docs and this section in the same commit. That includes `deploy/backup-*.sh`, `deploy/restore-*.sh`, `deploy/bootstrap-from-ops.sh`, `deploy/ci-deploy-wrapper.sh`, `deploy/backup-crypto.sh`, and `.github/workflows/*backup*`, `*restore*`, `*rebuild*`.

**Test without replacing live data:** Actions → **Backup Production**, then **Verify Restore**. That decrypts the backup and checks it.

**Live dress rehearsal:** Actions → **Backup and Restore** → type `RESTORE`. Brief downtime. Rolls back if `/api/health` fails.

**Same VPS (database wiped or bad deploy):**

1. GitHub → `panagiod/meti-booking` → Actions → **Restore Production**
2. Backup: `latest` (or `YYYY-MM-DD`)
3. Confirm: `RESTORE`
4. The VPS pulls `backups/*.db.enc` from `meti-studio-ops` and decrypts with `BACKUP_ENCRYPTION_KEY` already in `~/meti-booking/.env`

Manual on the live server:

```bash
ssh root@2.29.22.46
cd ~/meti-booking
CONFIRM=RESTORE ./deploy/restore-from-ops.sh latest
```

**VPS destroyed (new machine):**

1. New Ubuntu VPS + unrestricted SSH key
2. Secrets on `meti-booking`: `RECOVERY_HOST`, `RECOVERY_USER`, `RECOVERY_SSH_KEY`, `BACKUP_ENCRYPTION_KEY`, `OPS_REPO_TOKEN`
3. Actions → **Rebuild Production** → Confirm `REBUILD`
4. Point `meti-pilates.com` A record at the new IP
5. `./deploy/setup-cicd.sh` and update `PRODUCTION_HOST`

Do not `--force-reset` or cancel upcoming bookings. Do not commit plaintext `.env` or `data.db`.

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
- Greek genitive months — use **nominative** via `date-locale.ts`
- `bookingLeadHours` default is **2h** — use `resolveBookingLeadHours()`
- Hardcoded fees — use **`GET /api/checkout/quote`**
- `/api/advisors` needs auth — must be **public** for `/book`
- Payments work — MP not configured on demo; Stripe planned
- External image URLs — use `/public/images/` or admin upload
