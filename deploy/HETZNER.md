# Hetzner VPS deployment — ~€5/month

**Best for:** a real MeTi Pilates studio website — commercial use, custom domain, no cold starts, full control.

| Item | Cost |
|------|-----:|
| Hetzner CX22 (2 vCPU, 4 GB RAM) | ~**€4.5/mo** |
| Domain (e.g. `.gr`, `.com`) | ~**€10–15/yr** |
| SSL (Caddy + Let's Encrypt) | **€0** |
| Postgres (on same server) | **€0** |
| **Total** | **~€6/month** |

Stack: **Docker** → Postgres + Next.js app + **Caddy** (HTTPS).

---

## What you get

| Feature | VPS |
|---------|-----|
| Commercial booking site | ✅ |
| Custom domain + HTTPS | ✅ |
| Guest checkout | ✅ |
| Admin calendar + CMS | ✅ |
| Image uploads (local disk) | ✅ — no Vercel Blob needed |
| Database always on | ✅ — no Neon sleep |
| Daily cron jobs | ✅ — `setup-cron.sh` |
| Mercado Pago payments | ✅ — set `APP_URL` + `ENCRYPTION_KEY` |
| Email reminders | ✅ — add Resend |

---

## Overview

```
1. Create Hetzner CX22 server (Ubuntu 24.04)
2. Point domain DNS → server IP
3. Install Docker on the server
4. Clone repo, create .env
5. Run ./deploy/deploy.sh
6. Seed data + install cron jobs
7. Smoke test /book and /admin
```

**Time:** ~45 minutes first time.

---

## Step 1 — Hetzner server

1. Sign up at [hetzner.com/cloud](https://www.hetzner.com/cloud).
2. **Add project** → **Add server**.
3. Settings:
   - **Location:** Falkenstein or Helsinki (EU — good for Greece)
   - **Image:** Ubuntu 24.04
   - **Type:** **CX22** (2 vCPU, 4 GB RAM, 40 GB SSD) — enough for this app
   - **Networking:** Public IPv4 + IPv6
   - **SSH key:** add yours (recommended) or use root password once
4. Create server → note the **IP address**.

### Firewall (Hetzner Cloud Console)

In the server → **Firewalls** (or create one):

| Port | Protocol | Purpose |
|------|----------|---------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP (Let's Encrypt) |
| 443 | TCP | HTTPS |

---

## Step 2 — Domain DNS

Point your domain to the server IP.

**Cloudflare (recommended, free):**

1. Add site → use Cloudflare nameservers at your registrar.
2. **DNS** → **A record**:
   - Name: `@` (or `www`)
   - IPv4: your Hetzner IP
   - Proxy: **DNS only** (grey cloud) until HTTPS works, then orange cloud is OK

**Example:** `metipilates.gr` → `95.xxx.xxx.xxx`

Wait 5–30 minutes for DNS to propagate.

---

## Step 3 — Server setup (SSH)

```bash
ssh root@YOUR_SERVER_IP
```

### Create a deploy user (recommended)

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy/
```

Log in as deploy:

```bash
ssh deploy@YOUR_SERVER_IP
```

### Install Docker

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and back in so Docker group applies.

### Optional: UFW firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Step 4 — Clone the app

```bash
cd ~
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
```

### Create `.env`

```bash
cp deploy/env.production.example .env
nano .env
```

**Fill in these values:**

```bash
DOMAIN=metipilates.gr                    # your real domain
POSTGRES_PASSWORD=<strong-random-password>

BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://metipilates.gr
NEXT_PUBLIC_BETTER_AUTH_URL=https://metipilates.gr
APP_URL=https://metipilates.gr

STUDIO_TIMEZONE=Europe/Athens
CRON_SECRET=<openssl rand -hex 24>
ENCRYPTION_KEY=<openssl rand -base64 32>

SELF_HOSTED=1                            # enables local image uploads

# Optional
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=MeTi Pilates <bookings@metipilates.gr>
```

Update `DATABASE_URL` password to match `POSTGRES_PASSWORD`.

Generate secrets on your laptop or the server:

```bash
openssl rand -base64 32
openssl rand -hex 24
```

---

## Step 5 — Deploy

```bash
chmod +x deploy/*.sh
./deploy/deploy.sh
```

This will:

1. Start Postgres
2. Run database migrations
3. Build the Next.js Docker image
4. Start the app + Caddy (HTTPS)

First build takes **5–10 minutes**.

Open `https://yourdomain.com` — you should see the homepage.

---

## Step 6 — Seed studio data (first time)

```bash
# In .env, temporarily add:
# ALLOW_DEMO_SEED=1
# DEMO_PASSWORD=YourSecurePassword123!

./deploy/seed.sh
```

Creates admin, instructor, schedule, and CMS content.

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.meti-booking.local` | your `DEMO_PASSWORD` |
| Instructor | `instructor@meti-pilates.studio` | your `DEMO_PASSWORD` |

**Before going live:** create real accounts, change passwords, remove `ALLOW_DEMO_SEED` from `.env`.

---

## Step 7 — Cron jobs

Booking maintenance (expire unpaid bookings, reminders, cleanup):

```bash
./deploy/setup-cron.sh
```

Runs daily against your domain with `CRON_SECRET`.

### Database backups (recommended)

Add to crontab (`crontab -e` as deploy user):

```cron
0 4 * * * /home/deploy/meti-booking/deploy/backup-db.sh >> /home/deploy/backup.log 2>&1
```

Backups saved to `deploy/backups/` (last 14 kept).

---

## Step 8 — Smoke test

| URL | Check |
|-----|-------|
| `/` | Homepage loads over HTTPS |
| `/book` | Calendar shows dates |
| `/login` | Email sign-in works |
| `/admin` | Admin calendar + CMS |
| Checkout | Guest email → pay (MP when configured) |

---

## Google OAuth

Same as Vercel — see [GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md).

Add to Google Console:

- **Origin:** `https://metipilates.gr`
- **Redirect:** `https://metipilates.gr/api/auth/callback/google`

---

## Mercado Pago (real payments)

1. Set `APP_URL=https://metipilates.gr` and `ENCRYPTION_KEY` in `.env`.
2. Instructor logs in → **Advisor → Mercado Pago** → connect account.
3. Configure webhook in MP dashboard:
   `https://metipilates.gr/api/webhooks/mercadopago`

---

## Updating the live site

```bash
cd ~/meti-booking
git pull origin main
./deploy/deploy.sh
```

If only env changed (no code):

```bash
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

---

## Useful commands

```bash
# Logs
docker compose -f deploy/docker-compose.prod.yml logs -f app

# Restart app only
docker compose -f deploy/docker-compose.prod.yml restart app

# Migrations after schema change
./deploy/migrate.sh

# Manual DB backup
./deploy/backup-db.sh

# Stop everything
docker compose -f deploy/docker-compose.prod.yml down
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **502 / site down** | `docker compose -f deploy/docker-compose.prod.yml logs app` |
| **HTTPS certificate failed** | DNS must point to server; ports 80+443 open; `DOMAIN` in `.env` matches |
| **Can't upload images in admin** | Ensure `SELF_HOSTED=1` in `.env`; rebuild app |
| **Cron not running** | Re-run `./deploy/setup-cron.sh`; check `CRON_SECRET` |
| **DB connection error** | `docker compose -f deploy/docker-compose.prod.yml ps` — postgres healthy? |
| **Out of disk** | `docker system prune -a` (careful); expand Hetzner volume |

---

## Cost comparison

| Setup | Monthly | Best for |
|-------|--------:|----------|
| **Hetzner VPS** | ~€6 | Real studio — **recommended** |
| Vercel Pro + Neon | ~€25 | Zero server maintenance |
| Vercel Hobby free | €0 | Testing only — not commercial |

---

## Files reference

| File | Purpose |
|------|---------|
| `deploy/docker-compose.prod.yml` | Postgres + app + Caddy |
| `deploy/Dockerfile` | Production Next.js image |
| `deploy/Caddyfile` | HTTPS reverse proxy |
| `deploy/env.production.example` | `.env` template |
| `deploy/deploy.sh` | One-command deploy |
| `deploy/setup-cron.sh` | Daily maintenance jobs |
| `deploy/backup-db.sh` | Postgres backup |

See also [README.md](./README.md) and [../docs/CHEAPEST_HOSTING.md](../docs/CHEAPEST_HOSTING.md).
