# Meti Booking — Local Demo

Run a fully working demo on your machine in about 5 minutes. No paid services required for the core booking flow.

## What works in the demo

| Feature | Demo support |
|---|---|
| Landing, services, advisor profile | ✅ |
| Email/password login | ✅ |
| Admin / advisor / client dashboards | ✅ |
| Booking widget and slot generation | ✅ |
| Google OAuth | ⚠️ Optional (needs real Google credentials) |
| Mercado Pago checkout | ❌ Needs advisor MP credentials |
| LiveKit video calls | ❌ Needs LiveKit credentials |
| Email notifications | ❌ Needs Resend API key |
| Document uploads | ❌ Needs Vercel Blob token |

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local PostgreSQL)

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp .env.demo.example .env
```

### 3. Install dependencies

```bash
pnpm install
```

### 4. Prepare database and demo data

```bash
pnpm demo:setup
```

This runs migrations, seeds categories, and creates three demo accounts.

### 5. Start the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

All accounts use the same password: **`Demo1234!`**

| Role | Email | What to try |
|---|---|---|
| Admin | `admin@demo.meti-booking.local` | `/admin` — users, fees, verification |
| Advisor | `advisor@demo.meti-booking.local` | `/advisor` — services, schedule, profile |
| Client | `client@demo.meti-booking.local` | Browse advisors, book a slot, view dashboard |

### Suggested demo walkthrough

1. **Public flow** — open `/services`, open the demo advisor profile, pick a service, date, and time slot.
2. **Client flow** — log in as `client@demo.meti-booking.local`, complete booking until checkout (payment will be unavailable without Mercado Pago).
3. **Advisor flow** — log in as `advisor@demo.meti-booking.local`, review schedule and services.
4. **Admin flow** — log in as `admin@demo.meti-booking.local`, review platform settings.

## Reset demo data

```bash
docker compose down -v
docker compose up -d
pnpm demo:setup
```

## Troubleshooting

### `ECONNREFUSED` on database

Ensure PostgreSQL is running:

```bash
docker compose ps
docker compose logs postgres
```

### Auth errors on sign-up

Check that `.env` has `BETTER_AUTH_SECRET` and both `BETTER_AUTH_URL` values set to `http://localhost:3000`.

### Demo users already exist

`pnpm demo:setup` is idempotent — it updates existing demo users instead of failing.

## Next steps

- **Deploy online for free:** see [DEPLOYMENT.md](./DEPLOYMENT.md) — Phase 1 ($0/month)
- **Custom domain on a budget:** see [DEPLOYMENT.md](./DEPLOYMENT.md) — domain section
