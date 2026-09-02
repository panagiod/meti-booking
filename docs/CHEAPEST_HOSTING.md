# Cheapest hosting — $0/month

**Recommended stack:** [Vercel Hobby](https://vercel.com) (app) + [Neon](https://neon.tech) (database).

| Item | Cost |
|------|-----:|
| Hosting (Vercel) | **$0** |
| Database (Neon free tier) | **$0** |
| SSL + `*.vercel.app` subdomain | **$0** |
| Google OAuth | **$0** (optional) |
| **Total** | **$0/month** |

Custom domain is optional (~**$3–10/year**). See [Custom domain (optional)](#custom-domain-optional).

> ⚠️ **Real business website?** Read [Real studio website — honest limits](#real-studio-website--honest-limits) first.  
> **Production deploy:** [docs/HOSTING.md](./HOSTING.md) · [deploy/HETZNER.md](../deploy/HETZNER.md)

> **Time needed:** ~20 minutes first time.  
> **Prerequisites:** GitHub account, this repo on GitHub (`panagiod/meti-booking` or your fork).

---

## What works on the free plan

| Feature | Free tier |
|---------|-----------|
| Public website + `/book` | ✅ |
| Guest checkout (email, no account) | ✅ |
| Email/password login | ✅ |
| Admin calendar + CMS text | ✅ |
| Bundled hero/reformer images | ✅ |
| Daily cron jobs (expire bookings, cleanup) | ✅ |
| Google sign-in | ✅ if you add OAuth creds (free) |
| Admin image uploads | ⚠️ needs Vercel Blob (free tier exists) |
| Mercado Pago payments | ⚠️ needs MP account + `APP_URL` |
| Booking reminder emails | ⚠️ needs Resend (100/day free) |

For a **studio demo or soft launch**, the free stack is enough.

---

## Real studio website — honest limits

If MeTi Pilates is a **real business** (advertising classes, taking bookings, eventually payments), here is what matters.

### 1. Vercel Hobby ($0) is not for commercial use

[Vercel’s terms](https://vercel.com/docs/limits/fair-use-guidelines) say Hobby is **personal, non-commercial only**. A Pilates studio site is commercial because it:

- Advertises and sells a service (classes)
- Processes or will process payments (Mercado Pago checkout)
- Exists for the studio’s financial gain

**You should use Vercel Pro (~$20/month)** or self-host on a **VPS (~$5/month)** — not Hobby — for a real production site.

### 2. Recommended budgets for a real site

| Setup | Monthly | Best for |
|-------|--------:|----------|
| **Vercel Pro + Neon Launch** | ~$20–25 | Easiest ops, auto-deploy from GitHub |
| **Hetzner VPS + Docker** (see `deploy/`) | ~$5–7 | Cheapest long-term, more DIY |
| **Vercel Hobby + Neon free** | $0 | Testing / portfolio only — **not** real business |

Add **~$3–10/year** for a custom domain (strongly recommended — e.g. `metipilates.com` instead of `*.vercel.app`).

### 3. Infrastructure limits (free vs paid)

| Area | Neon free | Neon paid (Launch) | Vercel Hobby | Vercel Pro |
|------|-----------|-------------------|--------------|------------|
| **Commercial use** | ✅ | ✅ | ❌ | ✅ |
| **Storage** | 0.5 GB | pay per GB | — | — |
| **DB sleeps when idle** | Yes (5 min) | Can disable | — | — |
| **Compute cap** | 100 CU-hrs/mo | Pay as you go | — | — |
| **Cold start on first visit** | 2–5 s possible | Minimal if always-on | Same on app | Same |
| **Bandwidth** | 5 GB egress/mo | Higher | 100 GB/mo | 1 TB+ |
| **Cron jobs** | — | — | Daily only | Daily (same app) |
| **Support / SLA** | Community | Paid tiers | None | Email support |

For a **single small studio**, 0.5 GB and low traffic are usually enough on the database side. The bigger issue is **Neon sleeping** (slow first booking after quiet hours) and **Vercel Hobby not allowing commercial use**.

### 4. App-level limits (this codebase)

These apply regardless of hosting plan:

| Feature | Current behaviour | Impact on real studio |
|---------|-------------------|------------------------|
| **Booking window** | 8 weeks ahead | Fine for most studios |
| **Lead time** | 2 hours minimum before class | Configurable per advisor |
| **Capacity** | 3 spots per time slot | Hardcoded in `siteConfig` — change if you need more |
| **Schedule** | Mon/Wed/Sat 2–5pm (demo seed) | Admin can change in `/admin/schedule` |
| **Payments** | Mercado Pago per instructor | Must connect MP + set `APP_URL`, `ENCRYPTION_KEY` |
| **Guest checkout** | Email only, no password | Works — good for casual clients |
| **Reminder emails** | Daily cron + Resend | Needs `RESEND_API_KEY`; runs once per day, not hourly |
| **Pending bookings** | Expire at midnight (cron) | Unpaid slots held until daily job runs |
| **Admin images** | Vercel Blob in production | Needs `BLOB_READ_WRITE_TOKEN` to upload hero photos |
| **Video calls** | LiveKit (optional) | Not set up — booking is in-person reformer |
| **Greek + English** | ✅ | Production-ready |
| **Backups** | Neon free: 6h restore window | Upgrade Neon for longer point-in-time recovery |

### 5. What you need for launch (real studio checklist)

| Must have | Why |
|-----------|-----|
| Custom domain | Trust, SEO, email links |
| Vercel **Pro** or VPS | Legal/commercial hosting |
| Neon **Launch** (or VPS Postgres) | Avoid DB sleep during business hours |
| `ENCRYPTION_KEY` + Mercado Pago | Accept real payments |
| `APP_URL` + MP webhook | Confirm payments server-side |
| `RESEND_API_KEY` | Booking confirmations / reminders — [deploy/RESEND.md](../deploy/RESEND.md) |
| `BLOB_READ_WRITE_TOKEN` | Change hero/studio photos in admin |
| Real admin password | Remove demo `Demo1234!` accounts |
| Google OAuth (optional) | Easier login — see `deploy/GOOGLE_OAUTH.md` |

### 6. Realistic monthly cost (small studio)

| Item | Cost |
|------|-----:|
| Vercel Pro | ~$20 |
| Neon Launch (low traffic) | ~$0–5 |
| Domain | ~$1/mo (amortized) |
| Resend free tier | $0 (100 emails/day) |
| Vercel Blob free tier | $0 (1 GB) |
| Mercado Pago | % per transaction only |
| **Typical total** | **~$22–27/month** |

**Cheapest real-business alternative:** [Hetzner VPS ~€5/month](./deploy/HETZNER.md) — see [deploy/README.md](../deploy/README.md).

---

## Overview (5 steps)

```
1. Create Neon database     → copy DATABASE_URL
2. Import repo to Vercel    → paste env vars → Deploy
3. Run migrations           → pnpm db:deploy (one-time)
4. Seed demo data           → pnpm demo:setup (optional)
5. Smoke test               → open /book and /admin
```

---

## Step 1 — Neon database (free)

1. Go to [neon.tech](https://neon.tech) and sign up.
2. **New project** → name it e.g. `meti-booking`.
3. Open **Connection details** → copy the **pooled** connection string.  
   It looks like:
   ```
   postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save it — this is your `DATABASE_URL`.

**Neon free tier limits:** 0.5 GB storage, project may sleep after inactivity (first visit can be slow). Fine for a small studio.

---

## Step 2 — Vercel project (free)

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your Git repository (`meti-booking`).
3. Settings (defaults are fine):
   - Framework: **Next.js**
   - Root directory: `.`
   - Build command: `pnpm build`
   - Install command: `pnpm install`
4. **Do not deploy yet** — add environment variables first (Step 3).

---

## Step 3 — Environment variables

Generate three secrets on your computer:

```bash
openssl rand -base64 32   # → BETTER_AUTH_SECRET
openssl rand -base64 32   # → ENCRYPTION_KEY
openssl rand -hex 24      # → CRON_SECRET
```

In Vercel → your project → **Settings → Environment Variables**, add these for **Production**:

### Required (minimum — site will run)

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon connection string from Step 1 |
| `BETTER_AUTH_SECRET` | first `openssl` output |
| `BETTER_AUTH_URL` | `https://YOUR-PROJECT.vercel.app` *(set after first deploy if unknown)* |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | **same** as `BETTER_AUTH_URL` |
| `STUDIO_TIMEZONE` | `Europe/Athens` |
| `CRON_SECRET` | third `openssl` output |

### Recommended (add before going live)

| Name | Value |
|------|--------|
| `ENCRYPTION_KEY` | second `openssl` output — needed before Mercado Pago |
| `APP_URL` | same as `BETTER_AUTH_URL` — needed for payments |

### Optional (enable later)

| Name | Enables |
|------|---------|
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | Google sign-in — see [deploy/GOOGLE_OAUTH.md](../deploy/GOOGLE_OAUTH.md) |
| `BLOB_READ_WRITE_TOKEN` | Admin CMS image uploads — [Vercel Blob](https://vercel.com/storage) free tier |
| `RESEND_API_KEY` + `EMAIL_FROM` | Booking confirmation & reminder emails — [deploy/RESEND.md](../deploy/RESEND.md) |
| `MERCADOPAGO_ACCESS_TOKEN` | Platform-level MP (instructors also connect their own) |

**Tip:** If you don’t know your Vercel URL yet, deploy once with placeholder URLs, then update `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` / `APP_URL` to the real `https://….vercel.app` and **redeploy**.

Click **Deploy**.

---

## Step 4 — Database migrations (one-time)

On your machine (with Node 20+ and pnpm installed):

```bash
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
pnpm install

DATABASE_URL="postgresql://..." pnpm db:deploy
```

Replace `postgresql://...` with your Neon URL.

---

## Step 5 — Seed studio data (optional)

Creates demo users, schedule, services, and CMS content:

```bash
DATABASE_URL="postgresql://..." \
BETTER_AUTH_URL="https://YOUR-PROJECT.vercel.app" \
ALLOW_DEMO_SEED=1 \
DEMO_PASSWORD="YourSecurePassword123!" \
pnpm demo:setup
```

**Demo logins** (if you used the command above):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.meti-booking.local` | your `DEMO_PASSWORD` |
| Instructor | `instructor@meti-pilates.studio` | your `DEMO_PASSWORD` |
| Client | `client@demo.meti-booking.local` | your `DEMO_PASSWORD` |

Change passwords before sharing publicly, or create real accounts via `/register`.

---

## Step 6 — Validate & smoke test

### Validate env (optional)

```bash
BETTER_AUTH_URL=https://YOUR-PROJECT.vercel.app \
NEXT_PUBLIC_BETTER_AUTH_URL=https://YOUR-PROJECT.vercel.app \
DATABASE_URL="postgresql://..." \
BETTER_AUTH_SECRET="..." \
CRON_SECRET="..." \
STUDIO_TIMEZONE=Europe/Athens \
pnpm deploy:check
```

### Manual checks

| URL | Expected |
|-----|----------|
| `/` | MeTi homepage loads |
| `/book` | Calendar with available dates |
| `/login` | Email sign-in works |
| `/admin` | Admin login → calendar + CMS |

Pick a slot → checkout → enter guest email → pay button (MP unavailable until configured).

---

## Custom domain (optional)

**Cheapest domains:** Porkbun `.xyz` (~$3/yr promo), Cloudflare `.com` at-cost (~$10/yr).

1. Buy a domain (Cloudflare Registrar or Porkbun).
2. Vercel → Project → **Domains** → add `yourdomain.com`.
3. Add the DNS records Vercel shows (usually CNAME to `cname.vercel-dns.com`).
4. Update env vars and redeploy:
   ```
   BETTER_AUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
   APP_URL=https://yourdomain.com
   ```
5. If using Google OAuth, add the new domain in Google Cloud Console — see [deploy/GOOGLE_OAUTH.md](../deploy/GOOGLE_OAUTH.md).

**Cost after domain:** still **$0/month hosting** + ~**$3–10/year** for the name.

---

## Google sign-in (optional, free)

1. Follow [deploy/GOOGLE_OAUTH.md](../deploy/GOOGLE_OAUTH.md).
2. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to Vercel.
3. Redeploy — **Continue with Google** appears on `/login`.

Email/password works without Google.

---

## Updating the live site

Every push to `main` on GitHub triggers a new Vercel deployment automatically.

For database schema changes after pulling updates:

```bash
DATABASE_URL="postgresql://..." pnpm db:deploy
```

---

## Free tier limitations

| Limitation | Workaround |
|------------|------------|
| Neon sleeps when idle | First request may take 2–5 s — acceptable for small studios |
| Vercel cold starts | Same — rare on Hobby for low traffic |
| Crons run once per day | Enough for expire/cleanup; see `vercel.json` |
| No admin image upload without Blob | Use bundled images, or add free Vercel Blob token |
| Preview deploys need separate OAuth URIs | Use production URL for OAuth testing |

---

## When to spend money

| Situation | Cheapest upgrade | ~Cost |
|-----------|------------------|------:|
| Want your own domain | Cheap TLD + keep Vercel/Neon | $3–10/yr |
| Neon/Vercel limits hit | Hetzner VPS + Docker | ~$5/mo |
| Need more cron frequency | [cron-job.org](https://cron-job.org) free tier | $0 |
| Real payments | Mercado Pago (pay per transaction) | % per sale |

VPS instructions: [deploy/README.md](../deploy/README.md) and [docs/DEPLOYMENT.md](./DEPLOYMENT.md) Phase 3.

---

## Quick reference — copy/paste checklist

```
[ ] Neon project created → DATABASE_URL saved
[ ] Vercel project imported from GitHub
[ ] Env vars set (DATABASE_URL, BETTER_AUTH_*, STUDIO_TIMEZONE, CRON_SECRET)
[ ] First deploy succeeded
[ ] BETTER_AUTH_URL updated to real .vercel.app URL → redeploy
[ ] pnpm db:deploy run against Neon
[ ] pnpm demo:setup (optional)
[ ] /book and /admin tested
[ ] Google OAuth configured (optional)
[ ] Custom domain connected (optional)
```

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [docs/HOSTING.md](./HOSTING.md) | **Production hosting hub** (Hetzner recommended) |
| [deploy/HETZNER.md](../deploy/HETZNER.md) | Hetzner step-by-step guide |
| [deploy/VERCEL.md](../deploy/VERCEL.md) | Vercel checklist |
| [deploy/GOOGLE_OAUTH.md](../deploy/GOOGLE_OAUTH.md) | Google sign-in setup |
| [deploy/RESEND.md](../deploy/RESEND.md) | Resend email setup |
| [docs/DEPLOYMENT.md](./DEPLOYMENT.md) | All phases + migration paths |
| [.env.example](../.env.example) | Full environment variable list |

---

## Support commands

```bash
pnpm deploy:check    # validate production env vars
pnpm db:deploy       # apply database migrations
pnpm demo:setup      # seed studio data (needs ALLOW_DEMO_SEED=1 in prod)
```

**Estimated total cost to go live today: $0** (testing only) · **~$22–27/month** for a real studio on Vercel Pro + Neon.
