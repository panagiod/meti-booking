# Meti Booking — Deployment & Cost Plan

A phased plan to go from **$0/month demo** to the **cheapest sustainable production** setup.

## Cost summary

| Phase | Monthly cost | Domain (yearly) | Best for |
|---|---:|---:|---|
| **1. Free demo** | $0 | $0 (use `*.vercel.app`) | Showcasing, testing, early validation |
| **2. Budget production** | $0–5 | $3–12 | Small traffic, real users, custom domain |
| **3. Cheapest VPS** | ~$5–7 | $3–12 | Full control, predictable cost at scale |

---

## Phase 1 — Free demo ($0/month)

**Goal:** Get a public URL you can share without paying for hosting.

### Stack

| Service | Provider | Cost | Notes |
|---|---|---:|---|
| App hosting | [Vercel Hobby](https://vercel.com) | $0 | Native Next.js support, `vercel.json` crons already configured |
| Database | [Neon](https://neon.tech) free tier | $0 | 0.5 GB storage, enough for demo/low traffic |
| DNS / SSL | Vercel subdomain | $0 | `meti-booking.vercel.app` (or similar) |
| Auth | Google OAuth + email/password | $0 | Google Cloud OAuth is free |
| Email | Skip or Resend free tier | $0 | 100 emails/day on Resend free |
| File storage | Skip initially | $0 | Document upload disabled without Blob |
| Video | Skip initially | $0 | Calls disabled without LiveKit |
| Payments | Skip initially | $0 | Checkout shows "unavailable" without MP |

**Estimated total: $0/month**

### Deploy steps (Vercel + Neon)

1. **Create a Neon project**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a database and copy the connection string

2. **Push to GitHub** (already done if using this repo)

3. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `panagiod/meti-booking`
   - Framework preset: **Next.js**

4. **Set environment variables** in Vercel → Settings → Environment Variables:

   ```
   DATABASE_URL=postgresql://...
   BETTER_AUTH_SECRET=<openssl rand -base64 32>
   BETTER_AUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   CRON_SECRET=<openssl rand -hex 24>
   ```

5. **Run migrations** (one-time, from your machine):

   ```bash
   DATABASE_URL="your-neon-url" pnpm db:deploy
   ```

6. **Seed demo data** (optional):

   ```bash
   DATABASE_URL="your-neon-url" BETTER_AUTH_URL="https://your-app.vercel.app" pnpm demo:setup
   ```

7. **Configure Google OAuth**
   - [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

8. **Deploy** — Vercel builds automatically on push to `main`.

### Vercel cron limitations (Hobby plan)

The app uses daily crons (expire pending appointments, reminders, cleanup). This matches Vercel Hobby limits. For sub-hourly cron jobs you would need Vercel Pro ($20/mo) or an external cron service (e.g. [cron-job.org](https://cron-job.org) free tier hitting your API with `CRON_SECRET`).

### Phase 1 limitations

- Cold starts on free tier
- No custom domain (unless you add one in Phase 2)
- No video calls, payments, or file uploads without extra services
- Neon free tier sleeps after inactivity (first request may be slow)

---

## Phase 2 — Budget production with custom domain (~$3–12/year)

**Goal:** Real brand with a custom domain, still near-zero hosting cost.

### Cheapest domain options

| Registrar | Typical first-year price | Notes |
|---|---:|---|
| [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) | At-cost (~$9–10/yr for `.com`) | No markup, best long-term value |
| [Porkbun](https://porkbun.com) | ~$3–7/yr for `.xyz`, `.site` | Good for budget demos |
| [Namecheap](https://www.namecheap.com) | ~$1–3/yr promo TLDs | Watch renewal prices |

**Recommendation:** Buy the cheapest TLD you are happy with (`.com` if brand matters, `.xyz` if budget is tight). Use **Cloudflare DNS** (free) regardless of where you buy.

### Connect domain to Vercel (still $0 hosting)

1. Buy domain at Cloudflare or Porkbun
2. In Vercel → Project → Settings → Domains → add `yourdomain.com`
3. Point DNS:
   - **Cloudflare:** CNAME `@` or `www` → `cname.vercel-dns.com` (Vercel shows exact records)
   - Enable Cloudflare proxy (orange cloud) for free CDN + DDoS protection
4. Update env vars:
   ```
   BETTER_AUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
   APP_URL=https://yourdomain.com
   ```
5. Update Google OAuth redirect URI to the new domain

### Optional add-ons (still cheap)

| Service | Free tier | When to add |
|---|---|---|
| [Resend](https://resend.com) | 100 emails/day | Booking confirmations |
| [LiveKit Cloud](https://livekit.io) | Limited free | Video calls |
| [Vercel Blob](https://vercel.com/storage) | 1 GB | Document uploads |
| Mercado Pago | Pay per transaction | Real payments |

**Estimated total: $0/month hosting + $3–12/year domain**

---

## Phase 3 — Cheapest VPS (full control, ~$5–7/month)

**Goal:** Predictable cost, no vendor sleep/cold starts, run everything on one server.

Use this when:
- Neon/Vercel free tiers are too limiting
- You want Postgres + app on one bill
- You need more cron flexibility

### Recommended VPS

| Provider | Plan | Price | Specs |
|---|---|---:|---|
| [Hetzner Cloud](https://www.hetzner.com/cloud) | CX22 | ~€4.5/mo (~$5) | 2 vCPU, 4 GB RAM, 40 GB SSD |
| [Hetzner Cloud](https://www.hetzner.com/cloud) | CX32 | ~€7/mo | 4 vCPU, 8 GB RAM — if traffic grows |
| Oracle Cloud | Always Free ARM | $0 | Harder to set up, 4 ARM cores free forever |

### VPS stack (included in `deploy/`)

```
Internet → Cloudflare DNS (free) → Caddy (HTTPS) → Next.js app → PostgreSQL
```

Files provided:
- `deploy/Dockerfile` — production Next.js image
- `deploy/docker-compose.prod.yml` — app + Postgres + Caddy
- `deploy/Caddyfile` — automatic HTTPS via Let's Encrypt

### VPS deploy steps (outline)

1. Rent Hetzner CX22 (Ubuntu 24.04)
2. Point domain A record to server IP (Cloudflare DNS)
3. Install Docker on the server
4. Clone repo and copy `.env` with production values
5. Run:

   ```bash
   docker compose -f deploy/docker-compose.prod.yml up -d --build
   docker compose -f deploy/docker-compose.prod.yml exec app pnpm db:deploy
   docker compose -f deploy/docker-compose.prod.yml exec app pnpm demo:setup
   ```

6. Caddy obtains and renews SSL certificates automatically

### VPS cost optimization tips

- **Skip Vercel Blob** — store uploads on the VPS disk or Cloudflare R2 free tier (10 GB)
- **Skip Neon** — Postgres runs on the same VPS (included in compose file)
- **Skip paid email** — use Resend free tier or self-hosted SMTP later
- **Use Cloudflare** — free CDN, SSL, and basic protection in front of VPS
- **Backups** — Hetzner snapshots (~€0.60/mo) or `pg_dump` to R2

**Estimated total: ~$5–7/month VPS + $3–12/year domain**

---

## Decision guide

```
Need a demo URL today?
  └─ Phase 1: Vercel + Neon ($0)

Need a custom domain but low traffic?
  └─ Phase 2: Keep Vercel + add cheap domain ($0/mo + domain)

Hitting free-tier limits or need full control?
  └─ Phase 3: Hetzner VPS + Docker ($5/mo)
```

## Migration path

| From | To | Effort |
|---|---|---|
| Local demo | Vercel + Neon | Low — set env vars, run `db:deploy` |
| Vercel + Neon | VPS | Medium — export Neon DB, deploy Docker stack |
| Vercel Blob | Cloudflare R2 / local disk | Medium — change upload routes |
| Vercel crons | Caddy + cron on VPS | Low — same API endpoints |

## Environment variable checklist (production)

| Variable | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| `DATABASE_URL` | Neon | Neon | VPS Postgres |
| `BETTER_AUTH_SECRET` | ✅ | ✅ | ✅ |
| `BETTER_AUTH_URL` | vercel.app | custom domain | custom domain |
| `GOOGLE_CLIENT_ID/SECRET` | ✅ | ✅ | ✅ |
| `CRON_SECRET` | ✅ | ✅ | ✅ |
| `RESEND_API_KEY` | optional | recommended | optional |
| `LIVEKIT_*` | optional | when needed | when needed |
| `BLOB_READ_WRITE_TOKEN` | optional | when needed | replace with R2/local |
| `MERCADOPAGO_ACCESS_TOKEN` | when needed | when needed | when needed |

## Recommended path for this project

1. **This week:** Deploy Phase 1 to Vercel + Neon ($0) using `pnpm demo:setup` for demo accounts
2. **When ready for branding:** Buy a `.xyz` or `.com` domain (~$3–10/yr), connect via Cloudflare
3. **When traffic or limits grow:** Migrate to Hetzner CX22 (~$5/mo) using `deploy/docker-compose.prod.yml`

This keeps costs at **$0 until you need a domain**, then **~$1/month average** with a cheap domain, scaling to **~$5/month** only when free tiers are no longer enough.
