# Hosting guide — MeTi Pilates

How to put the booking site online. **For a real studio, use Hetzner VPS** (~€6/month total).

---

## Which option to choose

| Option | Monthly cost | Best for |
|--------|-------------:|----------|
| **[Hetzner VPS](#hetzner-vps-recommended)** | **~€6** | **Real studio website** — commercial, custom domain, payments |
| [Vercel](#vercel-alternative) | varies | Optional; production DB stays on VPS SQLite |
| [Local demo](#testing-only) | €0 | Laptop + `file:./data.db` — not public production |

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
| SQLite (same server) | €0 |
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
   │                                   └── SQLite (/var/lib/meti-booking/data.db)
   │
   └── cron (host) ──► /api/cron/* (Bearer CRON_SECRET)
```

### Full step-by-step guide

👉 **[deploy/LITE.md](../deploy/LITE.md)** — install, deploy, seed, cron, backups. **[deploy/HETZNER.md](../deploy/HETZNER.md)** — domain/DNS checklist.

### Quick deploy (on the server)

```bash
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
chmod +x deploy/*.sh
./deploy/install-lite.sh
FORCE=1 ./deploy/init-env-lite.sh yourdomain.com
./deploy/deploy-lite.sh
./deploy/setup-cron.sh
```

First-time seed (optional):

```bash
# In .env: ALLOW_DEMO_SEED=1 and DEMO_PASSWORD=...
./deploy/seed-lite.sh
```

### Environment variables (VPS)

Copy **`deploy/env.production.example`** → **`.env`** in the project root.

| Variable | Required | Notes |
|----------|----------|-------|
| `DOMAIN` | ✅ | e.g. `meti-pilates.com` — used by Caddy for HTTPS |
| `METI_DATA_DIR` | ✅ | e.g. `/var/lib/meti-booking` |
| `DATABASE_URL` | ✅ | `file:/var/lib/meti-booking/data.db` |
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
| [`deploy/deploy-lite.sh`](../deploy/deploy-lite.sh) | Build app + restart systemd + Caddy |
| [`deploy/init-env-lite.sh`](../deploy/init-env-lite.sh) | Generate `.env` with SQLite paths |
| [`deploy/seed-lite.sh`](../deploy/seed-lite.sh) | Seed studio data (`ALLOW_DEMO_SEED=1`) |
| [`deploy/setup-cron.sh`](../deploy/setup-cron.sh) | Install daily cron jobs on the server |
| [`deploy/backup-studio-data.sh`](../deploy/backup-studio-data.sh) | Encrypted SQLite backup |
| [`deploy/smoke-test.sh`](../deploy/smoke-test.sh) | Post-deploy HTTP checks |
| [`deploy/install-lite.sh`](../deploy/install-lite.sh) | First-time Ubuntu Node + Caddy setup |
| `pnpm deploy:check:hetzner` | Validate `.env` before VPS deploy |

### Updating the live site

```bash
cd ~/meti-booking
git pull origin main
./deploy/deploy-lite.sh
```

### Cron schedule (installed by `setup-cron.sh`)

| Job | UTC time | Endpoint |
|-----|----------|----------|
| Expire unpaid bookings | 00:00 | `/api/cron/expire-pending` |
| Booking reminders | 12:00 | `/api/cron/reminders` |
| Cleanup cancelled | 03:00 | `/api/cron/cleanup-cancelled` (prunes cancelled rows beyond the last 100 kept for admin) |
| Complete past classes | every 15 min | `/api/cron/complete-past` |
| Disk prune | 01:45 | `deploy/prune-disk.sh` (logs, journal, leftover local backups) |
| Encrypted backup | 02:00 | `deploy/backup-studio-data.sh` |

12:00 UTC ≈ 15:00 Nicosia (summer) / 14:00 (winter). Edit `/etc/cron.d/meti-booking` to change.

### Recommended backup cron

Lite / production SQLite backups are installed by `deploy/setup-cron.sh` and copied encrypted to a private ops repo. See [deploy/OPS.md](../deploy/OPS.md).

### Image uploads on VPS

With `SELF_HOSTED=1`, admin uploads save under `public/uploads/studio/` on disk. No Vercel Blob required.

See [docs/ADMIN.md](./ADMIN.md) → Website CMS → Image uploads.

---

## Vercel alternative

Easier operations, higher cost (~€25/month). Requires **Vercel Pro** for commercial use.

| Doc | Purpose |
|-----|---------|
| [deploy/VERCEL.md](../deploy/VERCEL.md) | Vercel checklist (not production DB) |
| [deploy/GOOGLE_OAUTH.md](../deploy/GOOGLE_OAUTH.md) | Google sign-in |
| [deploy/RESEND.md](../deploy/RESEND.md) | Booking & reminder emails (Resend) |
| [docs/CHEAPEST_HOSTING.md](./CHEAPEST_HOSTING.md) | $0 testing stack + real-business limits |

Validate env before deploy: `pnpm deploy:check`

---

## Testing only

**Vercel Hobby** — fine for UI demos only; production data lives on the VPS SQLite file (see [deploy/LITE.md](../deploy/LITE.md)).

See [docs/CHEAPEST_HOSTING.md](./CHEAPEST_HOSTING.md).

---

## Comparison matrix

| | Hetzner VPS (SQLite) | Vercel (optional front-end) |
|---|:---:|:---:|
| Commercial use | ✅ | Pro plan for business |
| Monthly cost | ~€6 | varies |
| Database | SQLite on VPS | Use VPS SQLite — not serverless Postgres |
| Admin image uploads | Local disk | `SELF_HOSTED` on VPS |
| Cron jobs | Host cron | Limited on Vercel |
| Backups | Encrypted SQLite scripts | Same VPS backups |

---

## Go-live checklist (real studio)

```
[ ] Hetzner CX23 server created (Ubuntu 24.04) — **not** CPX/CCX
[ ] Domain DNS → server IP
[ ] .env filled (DOMAIN, secrets, SELF_HOSTED=1)
[ ] ./deploy/deploy-lite.sh succeeded
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
