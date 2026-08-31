# MeTi Pilates — Local demo

Run the reformer booking app locally in ~5 minutes.

> **Full reference:** [PROJECT.md](./PROJECT.md) · **Admin guide:** [ADMIN.md](./ADMIN.md)

---

## What works

| Feature | Demo |
|---------|------|
| Homepage + `/book` | ✅ |
| Reformer-only · 3 per slot | ✅ |
| Tue/Thu/Sat afternoons | ✅ |
| EN + Greek (ΕΛ) + Greek fonts | ✅ |
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

`demo:setup` seeds: users, reformer service, **Tue/Thu/Sat 14:00–17:00** schedule, and **website content** (EN/EL copy + images).

---

## Demo accounts

Password: **`Demo1234!`**

| Role | Email | Try |
|------|-------|-----|
| Client | `client@demo.meti-booking.local` | Book at `/book` |
| Instructor | `instructor@meti-pilates.studio` | `/advisor` |
| Admin | `admin@demo.meti-booking.local` | `/admin/schedule`, `/admin/content` |

---

## Suggested walkthrough

### Customer

1. Homepage — switch to **ΕΛ**, note Greek fonts
2. **Book** — only Tue/Thu/Sat afternoons; "X θέσεις" on slots
3. Login as client → checkout (payment unavailable without MP)

### Admin

1. Login as admin → **Calendar** — change open days/hours, block a date
2. **Website** — edit hero headline (EN + EL), upload a new hero image, save
3. Open homepage in incognito — see your changes

---

## Reset demo

```bash
docker compose down -v
docker compose up -d
pnpm demo:setup
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| DB connection refused | `docker compose ps` |
| Auth errors | Check `BETTER_AUTH_SECRET` and URLs in `.env` |
| Images 404 after deploy | `images.unoptimized: true` in `next.config.ts` |
| CMS not showing changes | Click **Save changes** on `/admin/content` |
| Old schedule | Re-run `pnpm demo:setup` |
