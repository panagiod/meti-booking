# Live Demo Deployment — Flow Pilates

## Current public demo (Cloudflare Tunnel)

**Homepage:** https://sin-building-cardiovascular-lifetime.trycloudflare.com  
**Book sessions:** https://sin-building-cardiovascular-lifetime.trycloudflare.com/book

> ⚠️ Temporary `*.trycloudflare.com` URL — stays up while this cloud agent VM is running.

### Customer booking flow

1. Open **/book**
2. Choose a session type (Mat, Reformer, Private, Duo)
3. Pick a date and available time slot
4. Sign in and confirm booking

### Demo accounts

Password for all: `Demo1234!`

| Role | Email |
|---|---|
| Client | `client@demo.meti-booking.local` |
| Instructor | `instructor@flowpilates.studio` |
| Admin | `admin@demo.meti-booking.local` |

### What works

- Landing page, services listing, advisor profiles
- Email/password login
- Booking flow through checkout (Mercado Pago not configured)

### What needs setup

- Google OAuth (placeholder credentials — use email/password instead)
- Mercado Pago, LiveKit, Resend, Vercel Blob for full features

---

## Permanent free hosting options

### Option A — Render (recommended for $0)

1. Open: https://render.com/deploy?repo=https://github.com/panagiod/meti-booking
2. After deploy, set in Render → Environment:
   - `BETTER_AUTH_URL` = `https://<your-app>.onrender.com`
   - `NEXT_PUBLIC_BETTER_AUTH_URL` = same
   - `APP_URL` = same
3. Run migrations via Render shell:
   ```bash
   pnpm db:deploy
   BETTER_AUTH_URL=https://<your-app>.onrender.com pnpm demo:setup
   ```

Hostname will be `https://meti-booking.onrender.com` (or similar).

### Option B — Vercel + Neon ($0)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

### Generated secrets (for production deploy)

```
BETTER_AUTH_SECRET=iEfJZXUD+mi8XREBoPnSJJbPkdAfUtmg97vXGen5b4s=
CRON_SECRET=6f5b408828c6c61096affa81d63d4c2f9d6d4cbe4e2f6d84
```

Generate new secrets for production — do not reuse demo values.
