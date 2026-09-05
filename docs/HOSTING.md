# Hosting guide — MeTi Pilates

How to put the booking site online. **For a real studio, use Hetzner VPS** (~€6/month total).

---

## Which option to choose

| Option | Monthly cost | Best for |
|--------|-------------:|----------|
| **[Hetzner VPS](#hetzner-vps-recommended)** | **~€6** | **Real studio website** — commercial, custom domain, payments |
| [Vercel Pro + Neon](#vercel-alternative) | ~€25 | No server maintenance; pay for convenience |
| [Vercel Hobby + Neon free](#testing-only) | €0 | **Testing only** — not allowed for commercial use |

**Recommendation:** Hetzner **CX23** (Cost-Optimized) + your domain + Docker stack in `deploy/`.  
**Avoid CPX/CCX** — those are €17–20+/month (easy to pick by mistake).

---

## Hetzner VPS (recommended)

### Cost

| Item | Price |
|------|------:|
| [Hetzner CX23](https://www.hetzner.com/cloud) (2 vCPU, 4 GB RAM, 40 GB SSD, Germany/Finland) | ~€5.49/mo |
| IPv4 address (optional — IPv6-only saves ~€0.50) | ~€0.50/mo |
| Domain (`.gr`, `.com`, etc.) | ~€10–15/yr |
| SSL (Caddy + Let's Encrypt) | €0 |
| PostgreSQL (same server) | €0 |
| **Total** | **~€6/month** |

### What you get

- ✅ Commercial booking site (legal for a business)
- ✅ Custom domain + HTTPS (`https://meti-pilates.com`)
- ✅ Guest checkout + email/password login
- ✅ Admin calendar + website CMS
- ✅ Image uploads on server disk (no Vercel Blob)
- ✅ Database always on — no cold starts
- ✅ Mercado Pago payments (when configured)
- ✅ Daily cron jobs (expire bookings, reminders, cleanup)
- ✅ Downtime and high-usage emails every 15 minutes
- ✅ Daily database backups (script included)

### Architecture

```
Internet
   │
   ▼
Cloudflare DNS (optional, free)
   │
   ▼
Hetzner VPS (Ubuntu 24.04)
   │
   ├── Caddy (:443) ──► automatic HTTPS
   │       │
   │       └── reverse_proxy ──► Next.js app (:3000)
   │                                   │
   │                                   └── PostgreSQL (:5432, internal)
   │
   └── cron (host) ──► /api/cron/* (Bearer CRON_SECRET)
```

### Full step-by-step guide

👉 **[deploy/HETZNER.md](../deploy/HETZNER.md)** — create server, DNS, Docker, deploy, seed, cron, backups, troubleshooting.

### Quick deploy (on the server)

```bash
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
cp deploy/env.production.example .env    # edit DOMAIN, secrets, passwords
chmod +x deploy/*.sh
./deploy/deploy.sh
./deploy/setup-cron.sh
```

First-time seed (optional):

```bash
# In .env: ALLOW_DEMO_SEED=1 and DEMO_PASSWORD=...
./deploy/seed.sh
```

### Environment variables (VPS)

Copy **`deploy/env.production.example`** → **`.env`** in the project root.

| Variable | Required | Notes |
|----------|----------|-------|
| `DOMAIN` | ✅ | e.g. `meti-pilates.com` — used by Caddy for HTTPS |
| `POSTGRES_PASSWORD` | ✅ | Strong password for local Postgres |
| `DATABASE_URL` | ✅ | Auto-set in Docker; match password in compose |
| `BETTER_AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | `https://yourdomain.com` (no trailing slash) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | Same as above |
| `STUDIO_TIMEZONE` | ✅ | `Asia/Nicosia` |
| `CRON_SECRET` | ✅ | `openssl rand -hex 24` |
| `ENCRYPTION_KEY` | ✅ | MP token encryption — `openssl rand -base64 32` |
| `SELF_HOSTED` | ✅ | `1` — enables local disk image uploads |
| `APP_URL` | ✅ | Same as public URL — Mercado Pago webhooks |
| `GOOGLE_CLIENT_ID/SECRET` | Optional | Google sign-in — [deploy/GOOGLE_OAUTH.md](../deploy/GOOGLE_OAUTH.md) |
| `RESEND_API_KEY` | Optional | Booking emails — [deploy/RESEND.md](../deploy/RESEND.md) |
| `BLOB_READ_WRITE_TOKEN` | ❌ on VPS | Not needed — use `SELF_HOSTED=1` instead |

### Deploy scripts

| Script | Purpose |
|--------|---------|
| [`deploy/deploy.sh`](../deploy/deploy.sh) | Start Postgres → migrate → build & start app + Caddy |
| [`deploy/migrate.sh`](../deploy/migrate.sh) | Apply Prisma migrations after schema updates |
| [`deploy/seed.sh`](../deploy/seed.sh) | Seed studio data (`ALLOW_DEMO_SEED=1`) |
| [`deploy/setup-cron.sh`](../deploy/setup-cron.sh) | Install daily cron jobs on the server |
| [`deploy/backup-db.sh`](../deploy/backup-db.sh) | Backup Postgres to `deploy/backups/` |
| [`deploy/smoke-test.sh`](../deploy/smoke-test.sh) | Post-deploy HTTP checks |
| [`deploy/install-server.sh`](../deploy/install-server.sh) | First-time Ubuntu Docker + UFW setup |
| `pnpm deploy:check:hetzner` | Validate `.env` before VPS deploy |

### Updating the live site

```bash
cd ~/meti-booking
git pull origin main
./deploy/deploy.sh
```

### Cron schedule (installed by `setup-cron.sh`)

| Job | UTC time | Endpoint |
|-----|----------|----------|
| Expire unpaid bookings | 00:00 | `/api/cron/expire-pending` |
| Booking reminders | 12:00 | `/api/cron/reminders` |
| Cleanup cancelled | 03:00 | `/api/cron/cleanup-cancelled` |

12:00 UTC ≈ 15:00 Nicosia (summer) / 14:00 (winter). Edit `/etc/cron.d/meti-booking` to change.

### Recommended backup cron

Lite / production SQLite backups are installed by `deploy/setup-cron.sh` and copied encrypted to a private ops repo. See [deploy/OPS.md](../deploy/OPS.md).

### Docker files

| File | Role |
|------|------|
| `deploy/docker-compose.prod.yml` | Postgres + app + Caddy |
| `deploy/Dockerfile` | Production Next.js standalone image |
| `deploy/Dockerfile.migrate` | One-shot migration container |
| `deploy/Dockerfile.seed` | One-shot seed container |
| `deploy/Caddyfile` | HTTPS reverse proxy |

### Image uploads on VPS

With `SELF_HOSTED=1`, admin uploads save to a **persistent Docker volume** at `/app/public/uploads/studio/`. No Vercel Blob required.

See [docs/ADMIN.md](./ADMIN.md) → Website CMS → Image uploads.

---

## Vercel alternative

Easier operations, higher cost (~€25/month). Requires **Vercel Pro** for commercial use.

| Doc | Purpose |
|-----|---------|
| [deploy/VERCEL.md](../deploy/VERCEL.md) | Vercel + Neon checklist |
| [deploy/GOOGLE_OAUTH.md](../deploy/GOOGLE_OAUTH.md) | Google sign-in |
| [deploy/RESEND.md](../deploy/RESEND.md) | Booking & reminder emails (Resend) |
| [docs/CHEAPEST_HOSTING.md](./CHEAPEST_HOSTING.md) | $0 testing stack + real-business limits |

Validate env before deploy: `pnpm deploy:check`

---

## Testing only

**Vercel Hobby + Neon free = $0/month** — fine for demos, not for a live studio (Vercel prohibits commercial use on Hobby).

See [docs/CHEAPEST_HOSTING.md](./CHEAPEST_HOSTING.md).

---

## Comparison matrix

| | Hetzner VPS | Vercel Pro + Neon | Vercel Hobby (free) |
|---|:---:|:---:|:---:|
| Commercial use | ✅ | ✅ | ❌ |
| Monthly cost | ~€6 | ~€25 | €0 |
| Custom domain | ✅ | ✅ | ✅ |
| Cold starts | ❌ | Sometimes | Sometimes |
| DB always on | ✅ | Paid Neon | Sleeps when idle |
| Admin image uploads | Local disk | Vercel Blob | Blob or skip |
| Server maintenance | You | Vercel | Vercel |
| Cron jobs | Host cron | Vercel crons | Daily only |
| Backups | Your script | Neon PITR (paid) | 6h window (free) |

---

## Go-live checklist (real studio)

```
[ ] Hetzner CX23 server created (Ubuntu 24.04) — **not** CPX/CCX
[ ] Domain DNS → server IP
[ ] .env filled (DOMAIN, secrets, SELF_HOSTED=1)
[ ] ./deploy/deploy.sh succeeded
[ ] ./deploy/setup-cron.sh installed
[ ] Backup cron added (optional but recommended)
[ ] /book and /admin smoke tested over HTTPS
[ ] Demo passwords changed or real accounts created
[ ] Google OAuth configured (optional)
[ ] Mercado Pago + APP_URL + ENCRYPTION_KEY (for payments)
[ ] Resend for email reminders (optional)
```

---

## Related docs

| Doc | Contents |
|-----|----------|
| [deploy/HETZNER.md](../deploy/HETZNER.md) | Full Hetzner walkthrough |
| [deploy/README.md](../deploy/README.md) | VPS quick reference |
| [docs/DEPLOYMENT.md](./DEPLOYMENT.md) | All phases + migration paths |
| [docs/CHEAPEST_HOSTING.md](./CHEAPEST_HOSTING.md) | Cost breakdown + free tier limits |
| [docs/INTEGRATIONS.md](./INTEGRATIONS.md) | OAuth, payments, images |
| [.env.example](../.env.example) | All environment variables |
