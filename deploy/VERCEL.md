# Vercel deployment checklist

Use this when importing **meti-booking** to [Vercel](https://vercel.com/new) with a [Neon](https://neon.tech) database.

## 1. Import project

- Repository: `panagiod/meti-booking`
- Framework: **Next.js** (auto-detected)
- Root directory: `.` (default)
- Build command: default (`pnpm build` — runs `prisma generate` via `prebuild`)
- Install command: `pnpm install` (default)

`vercel.json` configures daily cron jobs (reminders, expire pending, cleanup).

## 2. Environment variables

Copy from `.env.example`. **Required for production:**

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon pooled connection string (`?sslmode=require`) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://your-app.vercel.app` (or custom domain) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Same as `BETTER_AUTH_URL` |
| `STUDIO_TIMEZONE` | `Europe/Athens` |
| `ENCRYPTION_KEY` | `openssl rand -base64 32` — required if advisors connect Mercado Pago |
| `CRON_SECRET` | `openssl rand -hex 24` — protects `/api/cron/*` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional but recommended for sign-in |
| `BLOB_READ_WRITE_TOKEN` | Required for admin CMS image uploads |
| `APP_URL` | Same as public URL — used for Mercado Pago return URLs |

**Optional (enable features):**

| Variable | Feature |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | Platform-level MP (advisor OAuth still per-advisor) |
| `RESEND_API_KEY` / `EMAIL_FROM` | Booking reminder emails |
| `LIVEKIT_*` | Video calls |
| `GROQ_API_KEY` | AI features |

Set all variables for **Production** (and Preview if you want branch deploys to work).

## 3. Database setup (one-time)

From your machine:

```bash
DATABASE_URL="postgresql://..." pnpm db:deploy
```

Optional demo seed (staging only):

```bash
DATABASE_URL="..." \
BETTER_AUTH_URL="https://your-app.vercel.app" \
ALLOW_DEMO_SEED=1 \
DEMO_PASSWORD="your-secure-password" \
pnpm demo:setup
```

## 4. Google OAuth

See **[GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md)** for the full checklist (origins, redirect URI, env vars, troubleshooting).

Quick: redirect URI = `https://your-app.vercel.app/api/auth/callback/google`

## 5. Validate env (optional)

Before or after setting Vercel env vars locally:

```bash
BETTER_AUTH_URL=https://your-app.vercel.app \
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app \
DATABASE_URL=... BETTER_AUTH_SECRET=... CRON_SECRET=... STUDIO_TIMEZONE=Europe/Athens \
pnpm deploy:check
```

## 6. Mercado Pago webhooks

Mercado Pago must reach your app for payment confirmation:

- Set `APP_URL` to the public Vercel URL
- Configure webhook in MP dashboard → `https://your-app.vercel.app/api/webhooks/mercadopago`

For local dev, use a tunnel (ngrok, Cloudflare).

## 7. Cron jobs

Vercel Hobby runs crons once per day (configured in `vercel.json`). Cron handlers require:

```
Authorization: Bearer <CRON_SECRET>
```

On Hobby, sub-hourly schedules are not available. For more frequent jobs, use [cron-job.org](https://cron-job.org) to hit your endpoints with the same header.

## 8. Post-deploy smoke test

1. Open `/book` — calendar loads (batch slots API)
2. Pick date/time → checkout without login (guest email)
3. Admin login → `/admin`
4. `/login` → Google sign-in (if OAuth configured)
5. Advisor MP connect (needs `ENCRYPTION_KEY`)

## 9. Custom domain

Vercel → Project → Domains → add domain → update DNS.

Then update:

```
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
APP_URL=https://yourdomain.com
```

Redeploy after changing env vars.

## Guest checkout

`POST /api/appointments` accepts `guestEmail` (+ optional `guestName`) when no session cookie is present. No account password is required; existing client emails are reused automatically.

See also [../docs/CHEAPEST_HOSTING.md](../docs/CHEAPEST_HOSTING.md) for the **$0/month** quick-start guide.
