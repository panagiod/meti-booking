# MeTi Pilates — Local demo

Run the reformer booking app locally in ~5 minutes.

> Full reference: [PROJECT.md](./PROJECT.md)

## What works

| Feature | Demo |
|---------|------|
| Homepage + `/book` | ✅ |
| Reformer-only sessions | ✅ |
| 3 bookings per time slot | ✅ |
| EN + Greek (ΕΛ) | ✅ |
| Email/password login | ✅ |
| Admin / instructor dashboards | ✅ |
| Google OAuth | ⚠️ needs real credentials |
| Mercado Pago checkout | ❌ needs instructor MP setup |
| LiveKit video | ❌ legacy feature, needs credentials |

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (PostgreSQL)

## Setup

```bash
docker compose up -d
cp .env.demo.example .env
pnpm install
pnpm demo:setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

Password: **`Demo1234!`**

| Role | Email | Try |
|------|-------|-----|
| Client | `client@demo.meti-booking.local` | Book at `/book`, view `/dashboard` |
| Instructor | `instructor@meti-pilates.studio` | `/advisor` — schedule, services |
| Admin | `admin@demo.meti-booking.local` | `/admin` |

> Note: `demo-setup` seeds **one service**: `Reformer Session` (50 min, €45).

## Suggested walkthrough

1. **Homepage** — switch to ΕΛ, click **Book reformer** / **Κράτηση**
2. **`/book`** — pick date → time (note "X left" on slots) → confirm
3. **Login** as client if prompted → checkout (payment unavailable without MP)
4. **Instructor** — log in, review schedule at `/advisor`

## Reset demo data

```bash
docker compose down -v
docker compose up -d
pnpm demo:setup
```

## Troubleshooting

**Database connection refused** — `docker compose ps` / `docker compose logs postgres`

**Auth errors** — ensure `.env` has `BETTER_AUTH_SECRET` and URLs set to `http://localhost:3000`

**Images broken after deploy** — see [INTEGRATIONS.md](./INTEGRATIONS.md) (`images.unoptimized: true`)

**Old instructor email** — use `instructor@meti-pilates.studio` (not `flowpilates.studio`)
