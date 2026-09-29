# Meti Booking — Deployment & Cost Plan

A phased plan to go from **$0/month demo** to the **cheapest sustainable production** setup.

> **Production:** [docs/HOSTING.md](./HOSTING.md) + [deploy/LITE.md](../deploy/LITE.md) — Hetzner VPS + **SQLite** (`file:/var/lib/meti-booking/data.db`).  
> **Local demo:** [CHEAPEST_HOSTING.md](./CHEAPEST_HOSTING.md) · `pnpm demo:setup` with `DATABASE_URL=file:./data.db`.

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
| Database | SQLite (`file:./data.db`) | $0 | Local demo only |
| DNS / SSL | Vercel subdomain | $0 | `meti-booking.vercel.app` (or similar) |
| Auth | Google OAuth + email/password | $0 | Google Cloud OAuth is free |
| Email | Skip or Resend free tier | $0 | 100 emails/day on Resend free |
| File storage | Skip initially | $0 | Document upload disabled without Blob |
| Video | Skip initially | $0 | Calls disabled without LiveKit |
| Payments | Skip initially | $0 | Checkout shows "unavailable" without MP |

**Estimated total: $0/month**

### Deploy steps (local demo)

1. `cp .env.demo.example .env`
2. `pnpm install && pnpm db:push && pnpm demo:setup && pnpm dev`
3. Open `http://localhost:3000/book` and sign in to `/admin`

For a public production site, use Hetzner + SQLite — [HOSTING.md](./HOSTING.md), not Vercel-hosted database files.

### Vercel cron limitations (Hobby plan)

The app uses daily crons (expire pending appointments, reminders, cleanup). This matches Vercel Hobby limits. For sub-hourly cron jobs you would need Vercel Pro ($20/mo) or an external cron service (e.g. [cron-job.org](https://cron-job.org) free tier hitting your API with `CRON_SECRET`).

### Phase 1 limitations

- Cold starts on free tier
- No custom domain (unless you add one in Phase 2)
- No video calls, payments, or file uploads without extra services
- Local SQLite only — not a public host

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

## Phase 3 — Hetzner VPS (~€5–7/month) — **recommended for production**

**Goal:** Cheapest **commercial** hosting with full control (SQLite on VPS).

👉 **Full guide:** [deploy/HETZNER.md](../deploy/HETZNER.md)  
👉 **Overview:** [docs/HOSTING.md](./HOSTING.md)

### Quick summary

| Item | Detail |
|------|--------|
| Server | Hetzner **CX23** (~€5.49/mo) — Ubuntu 24.04 — **not** CPX/CCX |
| Stack | Node + Caddy + SQLite (`file:/var/lib/meti-booking/data.db`) |
| Deploy | `./deploy/deploy-lite.sh` on the server |
| Uploads | `SELF_HOSTED=1` — local disk, no Vercel Blob |
| Cron | `./deploy/setup-cron.sh` |
| Backups | `./deploy/backup-studio-data.sh` |

### Recommended VPS

| Provider | Plan | Price | Specs |
|---|---|---:|---|
| [Hetzner Cloud](https://www.hetzner.com/cloud) | **CX23** | ~€5.49/mo | 2 vCPU, 4 GB RAM, 40 GB SSD — **pick this** |
| [Hetzner Cloud](https://www.hetzner.com/cloud) | CAX11 | ~€5.99/mo | ARM, 2 GB RAM — OK if CX23 unavailable |
| [Hetzner Cloud](https://www.hetzner.com/cloud) | CX33 | ~€8.49/mo | 4 vCPU, 8 GB RAM — if traffic grows |
| [Hetzner Cloud](https://www.hetzner.com/cloud) | CPX22 / CCX | €17–40+/mo | **Do not use** — dedicated vCPU, overkill |
| Oracle Cloud | Always Free ARM | $0 | Harder to set up, 4 ARM cores free forever |

### VPS stack (included in `deploy/`)

```
Internet → Cloudflare DNS (free) → Caddy (HTTPS) → Next.js app → SQLite on disk
```

See `deploy/LITE.md`, `deploy/deploy-lite.sh`, and `deploy/backup-studio-data.sh`.

### VPS deploy steps

See **[deploy/HETZNER.md](../deploy/HETZNER.md)** for the complete walkthrough. Short version:

```bash
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
cp deploy/env.production.example .env   # edit DOMAIN, secrets
chmod +x deploy/*.sh
./deploy/deploy-lite.sh
./deploy/setup-cron.sh
```

Caddy obtains SSL certificates automatically. For backups, cron details, and troubleshooting see the full guide.

### VPS cost optimization tips

- **Skip Vercel Blob** — store uploads on the VPS disk or Cloudflare R2 free tier (10 GB)
- **SQLite on VPS** — single `data.db` file, encrypted off-site backups via GitHub Actions
- **Skip paid email** — use Resend free tier or self-hosted SMTP later
- **Use Cloudflare** — free CDN, SSL, and basic protection in front of VPS
- **Backups** — `./deploy/backup-studio-data.sh` + private ops repo (see `deploy/OPS.md`)

**Estimated total: ~$5–7/month VPS + $3–12/year domain**

---

## Decision guide

```
Need a real studio website (commercial)?
  └─ Hetzner VPS + SQLite (~€6/mo) — deploy/LITE.md

Need to try the app on your laptop?
  └─ cp .env.demo.example .env && pnpm db:push && pnpm demo:setup && pnpm dev
```

## Environment variable checklist (production VPS)

| Variable | Notes |
|---|---|
| `DATABASE_URL` | `file:/var/lib/meti-booking/data.db` |
| `BETTER_AUTH_SECRET` | ✅ |
| `BETTER_AUTH_URL` | `https://yourdomain.com` |
| `STUDIO_TIMEZONE` | `Asia/Nicosia` |
| `ENCRYPTION_KEY` | ✅ before Mercado Pago |
| `CRON_SECRET` | ✅ |
| `SELF_HOSTED` | `1` |
| `GOOGLE_CLIENT_ID/SECRET` | optional |
| `RESEND_API_KEY` | recommended |
| `APP_URL` | when Mercado Pago |

## Recommended path for this project

1. **Real studio (MeTi Pilates):** Hetzner CX23 + SQLite — [deploy/LITE.md](../deploy/LITE.md) (~€6/mo + domain)
2. **Local demo:** [CHEAPEST_HOSTING.md](./CHEAPEST_HOSTING.md)
