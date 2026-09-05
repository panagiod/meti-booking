# MeTi Pilates — Local demo

Run the reformer booking app locally in ~5 minutes.

> **Full reference:** [PROJECT.md](./PROJECT.md) · **Admin guide:** [ADMIN.md](./ADMIN.md)

---

## What works

| Feature | Demo |
|---------|------|
| Homepage + `/book` | ✅ |
| Reformer-only · 3 per slot | ✅ |
| Tue/Thu/Sat (default seed) | ✅ (admin can change) |
| 8-week booking horizon | ✅ |
| EUR pricing | ✅ |
| Asia/Nicosia timezone | ✅ |
| 2h booking lead time | ✅ |
| Server pricing on /book | ✅ |
| Greek by default + optional EN | ✅ |
| Greek dates (genitive with a day) | ✅ e.g. 3 Σεπτεμβρίου |
| Admin calendar (`/admin/schedule`) | ✅ |
| Admin website CMS (`/admin/content`) | ✅ |
| Email/password login | ✅ |
| Google OAuth | ⚠️ needs real credentials |
| Mercado Pago checkout | ❌ not configured |
| LiveKit video | ❌ legacy |

---

## Setup

```bash
docker compose up -d
cp .env.demo.example .env
pnpm install
pnpm demo:setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

`demo:setup` seeds on **first run**: users, reformer service, **Mon/Wed/Sat 14:00–17:00** schedule, and **website content** (EN/EL copy + images).

**Re-running `pnpm demo:setup` preserves** admin calendar, blocked dates, and website CMS changes.

### Demo setup flags

| Flag | Effect |
|------|--------|
| `--reset` | Re-seed schedule + services to defaults (keeps CMS + blocked dates) |
| `--reset-content` | Reset website CMS to code defaults |

```bash
pnpm demo:setup -- --reset
pnpm demo:setup -- --reset-content
```

### Production demo seed

Blocked by default in production. To run intentionally:

```bash
ALLOW_DEMO_SEED=1 DEMO_PASSWORD="your-secure-password" pnpm demo:setup
```

---

## Demo accounts

Password: **`Demo1234!`** (local default; override with `DEMO_PASSWORD` env)

| Role | Email | Try |
|------|-------|-----|
| Client | `client@demo.meti-booking.local` | Book at `/book` |
| Instructor | `instructor@meti-pilates.studio` | `/advisor` |
| Admin | `admin@demo.meti-booking.local` | `/admin/schedule`, `/admin/content` |

---

## Suggested walkthrough

### Customer

1. Homepage — opens in **ΕΛ**; optional **EN**. Note Greek fonts and dates on `/book`
2. **Book** — open days from admin calendar; "X θέσεις" on slots
3. Login as client → checkout (payment unavailable without MP)

### Admin

1. Login as admin → **Calendar** — change open days/hours, set lunch break, block a date
2. **Website** — edit hero headline (EN + EL), upload a new hero image, save
3. Open homepage in incognito — see your changes

---

## Reset demo

**Full wipe** (database volume):

```bash
docker compose down -v
docker compose up -d
pnpm demo:setup
```

**Reset schedule/services only** (keep CMS and blocked dates):

```bash
pnpm demo:setup -- --reset
```

**Reset website CMS only:**

```bash
pnpm demo:setup -- --reset-content
```

**Reset schedule to Mon/Wed/Sat 2–5pm without full re-seed:**

```bash
pnpm exec tsx scripts/reset-studio-schedule.ts
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| DB connection refused | `docker compose ps` |
| Auth errors | Check `BETTER_AUTH_SECRET` and URLs in `.env` |
| `/book` shows "Something went wrong" | Ensure server is running; public APIs must not be blocked |
| Images 404 after deploy | `images.unoptimized: true` in `next.config.ts` |
| Image upload fails in prod | Set `BLOB_READ_WRITE_TOKEN` |
| CMS not showing changes | Hard-refresh homepage; text needs **Save changes**, images save on upload |
| Old schedule | `pnpm demo:setup -- --reset` or edit `/admin/schedule` |
| Greek months show genitive | Should be fixed — refresh; uses `date-locale.ts` |
