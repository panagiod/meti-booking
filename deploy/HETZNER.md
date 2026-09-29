# Hetzner VPS deployment — from ~€5.50/month

**Best for:** a real MeTi Pilates studio website — commercial use, custom domain, no cold starts, full control.

> **Pick the right server type.** Use **CX23** or **CAX11** in **Germany/Finland** (~€5.50–6/mo).  
> **Do not** pick **CPX** or **CCX** — those start around **€17–20+/month** after Hetzner’s 2026 price changes.

### “Why is it so expensive?” (common mistake)

| You might see… | What it is | Monthly (approx.) |
|----------------|------------|------------------:|
| **CX23** | Cost-Optimized — **this is the one you want** | **~€5.49** |
| **CAX11** | ARM Cost-Optimized — OK alternative | ~€5.99 |
| **CPX22** | Dedicated AMD vCPU — **wrong for a small studio site** | **~€19** |
| **CCX13+** | Dedicated performance — way overkill | **€40+** |

Hetzner renamed **CX22 → CX23** in 2026 and raised prices (~€3.99 → €5.49). If the console shows **€17–20+**, you almost certainly selected **CPX** or **CCX** — go back and choose **Cost-Optimized → CX23**.

📖 **Also see:** [docs/HOSTING.md](../docs/HOSTING.md) — hosting overview, env vars, scripts, go-live checklist.

## Table of contents

1. [Cost](#cost)
2. [What you get](#what-you-get)
3. [Overview](#overview)
4. [Step 1 — Hetzner server](#step-1--hetzner-server)
5. [Step 2 — Domain DNS](#step-2--domain-dns)
6. [Step 3 — Server setup](#step-3--server-setup-ssh)
7. [Step 4 — Clone the app](#step-4--clone-the-app)
8. [Step 5 — Deploy](#step-5--deploy)
9. [Step 6 — Seed data](#step-6--seed-studio-data-first-time)
10. [Step 7 — Cron jobs](#step-7--cron-jobs)
11. [Step 8 — Smoke test](#step-8--smoke-test)
12. [Google OAuth](#google-oauth)
13. [Mercado Pago](#mercado-pago-real-payments)
14. [Updating](#updating-the-live-site)
15. [Troubleshooting](#troubleshooting)

| Item | Cost |
|------|-----:|
| Hetzner **CX23** (2 vCPU, 4 GB RAM, Germany/Finland) | ~**€5.49/mo** |
| Hetzner **CAX11** (ARM, 2 GB RAM — tighter, see below) | ~**€5.99/mo** |
| Domain (meti-pilates.com — you already have this) | ~**€10–15/yr** |
| SSL (Caddy + Let's Encrypt) | **€0** |
| SQLite (on same server) | **€0** |
| **Total** | **~€6–7/month** |

Stack: **Node + Caddy + SQLite** (lite deploy — see [LITE.md](./LITE.md)).

---

## What you get

| Feature | VPS |
|---------|-----|
| Commercial booking site | ✅ |
| Custom domain + HTTPS | ✅ |
| Guest checkout | ✅ |
| Admin calendar + CMS | ✅ |
| Image uploads (local disk) | ✅ — no Vercel Blob needed |
| Database always on | ✅ — SQLite on VPS |
| Daily cron jobs | ✅ — `setup-cron.sh` |
| Mercado Pago payments | ✅ — set `APP_URL` + `ENCRYPTION_KEY` |
| Email reminders | ✅ — add Resend |

---

## Overview

```
1. Create Hetzner CX23 server in Germany or Finland (Ubuntu 24.04)
2. Point meti-pilates.com DNS → server IP
3. Run `./deploy/install-lite.sh` (Node + Caddy)
4. Clone repo, create `.env` with `./deploy/init-env-lite.sh`
5. Run `./deploy/deploy-lite.sh`
6. Seed data + install cron jobs
7. Smoke test /book and /admin
```

**Time:** ~45 minutes first time.

---

## Step 1 — Hetzner server (cheapest option)

1. Sign up at [hetzner.com/cloud](https://www.hetzner.com/cloud).
2. **Add project** → **Add server**.
3. Settings:
   - **Location:** **Germany (Falkenstein/Nuremberg) or Finland** — cheapest; avoid USA/Singapore if price matters
   - **Image:** Ubuntu 24.04
   - **Type:** **CX23** (Cost-Optimized / shared, ~€5.49/mo, 4 GB RAM) — **recommended**
     - Alternative: **CAX11** (ARM, ~€5.99/mo, 2 GB RAM) — only if CX23 unavailable; first deploy may be slow
   - **Do NOT choose:** CPX11, CPX22, CCX… (€17–20+/month)
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

## Step 2 — Domain DNS (point meti-pilates.com → your server)

**Goal:** When someone opens `https://meti-pilates.com`, their browser must reach your Hetzner server IP.

You need:
- Your **Hetzner IPv4** (from the server page in Hetzner Cloud, e.g. `95.123.45.67`)
- Access to where you bought **meti-pilates.com** (registrar) — or Cloudflare if you use it

### Which path are you on?

| Situation | What to do |
|-----------|------------|
| Domain only at registrar (GoDaddy, Namecheap, Papaki, etc.) | **Path A** — add an A record there |
| You use **Cloudflare** for DNS | **Path B** — add an A record in Cloudflare |
| Not sure | Log in where you bought the domain → look for **DNS** or **Manage DNS** |

---

### Path A — DNS at your registrar (simplest)

1. Log in to the site where you bought **meti-pilates.com**.
2. Open **DNS settings** / **DNS management** / **Zone editor** (name varies).
3. **Delete or edit** any old A record for `@` that points to a wrong IP (e.g. old Vercel, parking page).
4. **Add** these records:

| Type | Name / Host | Value / Points to | TTL |
|------|-------------|-------------------|-----|
| **A** | `@` (or blank, or `meti-pilates.com`) | `YOUR_HETZNER_IP` | 300 or Auto |
| **A** | `www` | `YOUR_HETZNER_IP` | 300 or Auto |

**Examples by registrar:**

- **Name / Host = `@`** → `meti-pilates.com` and `https://meti-pilates.com`
- **Name / Host = `www`** → `www.meti-pilates.com`

5. **Save** changes.
6. Do **not** add CNAME for `@` to Vercel/Netlify if you are moving to Hetzner — the A record must be your Hetzner IP.

---

### Path B — Cloudflare

Use this if nameservers look like `*.ns.cloudflare.com`.

1. [dash.cloudflare.com](https://dash.cloudflare.com) → your site **meti-pilates.com**.
2. **DNS** → **Records**.
3. Remove wrong A records (old hosting).
4. **Add record:**

| Type | Name | IPv4 address | Proxy status |
|------|------|--------------|--------------|
| A | `@` | `YOUR_HETZNER_IP` | **DNS only** (grey cloud ☁️) |
| A | `www` | `YOUR_HETZNER_IP` | **DNS only** (grey cloud) |

**Why grey cloud first?** Orange cloud (proxied) can interfere until Caddy has a certificate. After `https://meti-pilates.com` works, you may switch to orange cloud if you want Cloudflare CDN.

If the domain is **not** on Cloudflare yet:
1. Cloudflare → **Add site** → enter `meti-pilates.com`.
2. Cloudflare shows **two nameservers** (e.g. `ada.ns.cloudflare.com`).
3. At your **registrar**, replace nameservers with Cloudflare’s.
4. Wait until Cloudflare shows the site as **Active**, then add the A records above.

---

### Check that DNS is working

From your **laptop** (replace IP):

```bash
# macOS / Linux
dig +short meti-pilates.com A
dig +short www.meti-pilates.com A

# or
nslookup meti-pilates.com
```

Both should return **your Hetzner IPv4**.

Online checker: [https://dnschecker.org](https://dnschecker.org) → type `meti-pilates.com` → should show your IP worldwide (can take up to 24–48 h in rare cases; usually **5–30 minutes**).

**Quick browser test (before HTTPS):**  
`http://YOUR_HETZNER_IP` — after deploy, you should see the site (certificate step needs DNS first).

---

### When to do this vs `./deploy/deploy-lite.sh`

| Order | Step |
|-------|------|
| 1 | Create Hetzner server → note **IPv4** |
| 2 | **Set DNS A records** (this step) |
| 3 | SSH in, clone repo, create `.env` with `DOMAIN=meti-pilates.com` |
| 4 | Run `./deploy/deploy-lite.sh` — Caddy requests Let's Encrypt cert **using your domain** |

HTTPS will only work after:
- DNS points to the server **and**
- Ports **80** and **443** are open **and**
- `DOMAIN=meti-pilates.com` in `.env`

You can run deploy before DNS propagates; the site may not get HTTPS until DNS is correct. Then re-run:

```bash
sudo systemctl reload caddy
```

---

### Common mistakes

| Problem | Fix |
|---------|-----|
| Site still shows old host / parking page | Old A record still there; wait for TTL or lower TTL to 300 |
| `dig` shows wrong IP | Edit A record at registrar/Cloudflare; clear local DNS cache |
| Certificate / HTTPS fails | DNS not pointing to server yet; use grey cloud on Cloudflare |
| Only `www` works, not bare domain | Add A record for `@` as well as `www` |
| Used AAAA (IPv6) only | Add **A** record with IPv4 — most visitors need it |

**Example (correct):** `meti-pilates.com` → A → `95.123.45.67`

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

### Install Node + Caddy (lite)

From the repo root on the server (as root or with sudo):

```bash
sudo ./deploy/install-lite.sh
```

This installs Node 22, Caddy, SQLite tooling, swap, and opens ports 80/443 in UFW.

---

## Step 4 — Clone the app

```bash
cd ~
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
```

### Create `.env`

**Easiest — auto-generate secrets:**

```bash
chmod +x deploy/*.sh
./deploy/init-env-lite.sh
```

Uses `meti-pilates.com` by default. Another domain: `./deploy/init-env-lite.sh yourdomain.com`  
Overwrite existing `.env`: `FORCE=1 ./deploy/init-env-lite.sh`

**Or manual:**

```bash
cp deploy/env.production.example .env
nano .env
```

**Fill in these values:**

```bash
DOMAIN=meti-pilates.com                    # your real domain
METI_DATA_DIR=/var/lib/meti-booking
DATABASE_URL=file:/var/lib/meti-booking/data.db

BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://meti-pilates.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://meti-pilates.com
APP_URL=https://meti-pilates.com

STUDIO_TIMEZONE=Asia/Nicosia
CRON_SECRET=<openssl rand -hex 24>
ENCRYPTION_KEY=<openssl rand -base64 32>

SELF_HOSTED=1                            # enables local image uploads

# Optional — see deploy/RESEND.md for email setup
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM="MeTi Pilates <bookings@meti-pilates.com>"
STUDIO_NOTIFICATION_EMAIL=studio@example.com
```

Generate secrets on your laptop or the server:

```bash
openssl rand -base64 32
openssl rand -hex 24
```

Validate before deploy (requires Node/pnpm on server, or run locally with the same `.env`):

```bash
pnpm deploy:check:hetzner
```

---

## Step 5 — Deploy

```bash
chmod +x deploy/*.sh
./deploy/deploy-lite.sh
```

This will:

1. Apply the SQLite schema (`prisma db push`)
2. Build the Next.js app
3. Restart the `meti-booking` systemd service
4. Reload Caddy (HTTPS)

First build takes **5–8 minutes**.

Open `https://yourdomain.com` — you should see the homepage.

---

## Step 6 — Seed studio data (first time)

```bash
# In .env, temporarily add:
# ALLOW_DEMO_SEED=1
# DEMO_PASSWORD=YourSecurePassword123!

./deploy/seed-lite.sh
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

Automated:

```bash
./deploy/smoke-test.sh https://meti-pilates.com
```

Manual:

| URL | Check |
|-----|-------|
| `/` | Homepage loads over HTTPS |
| `/book` | Calendar shows dates |
| `/login` | Email sign-in works |
| `/admin` | Admin calendar + CMS |
| Checkout | Guest email → pay (MP when configured) |

---

## Step 9 — Auto-deploy (CI/CD)

After the site works manually, enable **automatic deploys** so you never run `git pull` / `./deploy/deploy-lite.sh` again.

**On the server (once):**

```bash
cd ~/meti-booking
git pull
./deploy/setup-cicd.sh
```

Copy the three values into GitHub → **Settings → Secrets and variables → Actions**:

- `PRODUCTION_HOST`
- `PRODUCTION_USER`
- `PRODUCTION_SSH_KEY`

Full guide: **[CICD.md](./CICD.md)**

Every push to `main` will rebuild and restart the site (~10–15 min). Deploy logs: `/var/log/meti-booking/deploy.log`.

---

## Google OAuth

Same as Vercel — see [GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md).

Add to Google Console:

- **Origin:** `https://meti-pilates.com`
- **Redirect:** `https://meti-pilates.com/api/auth/callback/google`

---

## Mercado Pago (real payments)

1. Set `APP_URL=https://meti-pilates.com` and `ENCRYPTION_KEY` in `.env`.
2. Instructor logs in → **Advisor → Mercado Pago** → connect account.
3. Configure webhook in MP dashboard:
   `https://meti-pilates.com/api/webhooks/mercadopago`

---

## Updating the live site

```bash
cd ~/meti-booking
git pull origin main
./deploy/deploy-lite.sh
```

If only env changed (no code):

```bash
sudo systemctl restart meti-booking
```

---

## Useful commands

```bash
# App logs
journalctl -u meti-booking -f

# Restart app
sudo systemctl restart meti-booking

# Schema change on server
pnpm db:push

# Manual encrypted DB backup
./deploy/backup-studio-data.sh
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **502 / site down** | `journalctl -u meti-booking -n 80 --no-pager` |
| **HTTPS certificate failed** | DNS must point to server; ports 80+443 open; `DOMAIN` in `.env` matches |
| **Can't upload images in admin** | Ensure `SELF_HOSTED=1` in `.env`; rebuild app |
| **Cron not running** | Re-run `./deploy/setup-cron.sh`; check `CRON_SECRET` |
| **DB connection error** | Check `DATABASE_URL=file:/var/lib/meti-booking/data.db` and file permissions under `/var/lib/meti-booking` |
| **Out of disk** | `./deploy/prune-disk.sh --urgent` (logs, journal, leftover backups, build cache). Journald is capped at 200M. Expand the Hetzner volume only if the live DB or uploads are the bulk. |

---

## Cost comparison

| Setup | Monthly | Best for |
|-------|--------:|----------|
| **Hetzner CX23** | ~€5.50 | Real studio — **recommended cheapest** |
| Managed PaaS | ~€25+ | Less ops; still use VPS SQLite for production data |
| Vercel Hobby free | €0 | Testing only — not commercial |

---

## Files reference

| File | Purpose |
|------|---------|
| `deploy/deploy-lite.sh` | Build + restart app |
| `deploy/init-env-lite.sh` | Generate `.env` with SQLite paths |
| `deploy/install-lite.sh` | Node + Caddy on Ubuntu |
| `deploy/setup-cron.sh` | Daily maintenance jobs |
| `deploy/backup-studio-data.sh` | Encrypted SQLite backup |

See also [README.md](./README.md) and [../docs/CHEAPEST_HOSTING.md](../docs/CHEAPEST_HOSTING.md).
