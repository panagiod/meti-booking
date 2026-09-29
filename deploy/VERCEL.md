# Vercel (optional front-end only)

**Production MeTi Pilates uses a Hetzner VPS with SQLite** — see [LITE.md](./LITE.md) and [docs/HOSTING.md](../docs/HOSTING.md).

Vercel serverless functions do **not** persist a SQLite file on disk. Do not point production bookings at Vercel unless you also host the database on the VPS (recommended).

## If you still import to Vercel (previews / experiments)

- Repository: `panagiod/meti-booking`
- Framework: **Next.js**
- Build: default (`pnpm build`)

Set environment variables from `.env.example`. For any environment that talks to a real database, use the **same** `DATABASE_URL` as your VPS (`file:…` only works when the app runs on that machine — not on Vercel).

Validate env: `pnpm deploy:check`

See [GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md), [RESEND.md](./RESEND.md), and [docs/HOSTING.md](../docs/HOSTING.md).
