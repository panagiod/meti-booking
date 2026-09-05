# Live demo status — MeTi Pilates

> Ephemeral Cloudflare tunnel — **only works while the Cursor cloud VM is running.**

## Public URLs (when VM + server are up)

| Page | URL |
|------|-----|
| Homepage | https://sin-building-cardiovascular-lifetime.trycloudflare.com |
| Book | https://sin-building-cardiovascular-lifetime.trycloudflare.com/book |
| Admin calendar | …/admin/schedule |
| Admin website | …/admin/content |

If **502**, restart:

```bash
cd /workspace
pnpm build
export $(grep -v '^#' .env | xargs) && pnpm start
```

Tunnel: `cloudflared tunnel --url http://localhost:3000`

---

## What the demo shows

- **MeTi Pilates** — hero: "Book your session." / "Κλείστε το μάθημά σας."
- **Reformer-only** booking · **3 spots per slot** · **EUR (€10)**
- **Mon, Wed, Sat · 2pm–5pm** (demo seed; admin-editable)
- **8 weeks** booking horizon · **Asia/Nicosia** timezone
- **Greek by default** (`ΕΛ`), optional English — cookie `meti-lang`
- Greek dates: **3 Σεπτεμβρίου** (with a day), **Σεπτέμβριος 2026** (month only)
- **Admin CMS** — edit text + images at `/admin/content`
- **Admin calendar** — hours, lunch breaks, blocked dates at `/admin/schedule`
- Local reformer images + MeTi OG/favicons

---

## Demo accounts

Password: **`Demo1234!`**

| Role | Email |
|------|-------|
| Client | `client@demo.meti-booking.local` |
| Instructor | `instructor@meti-pilates.studio` |
| Admin | `admin@demo.meti-booking.local` |

---

## Feature status

| Feature | Demo |
|---------|------|
| Booking UI + capacity | ✅ |
| Server-side slot validation | ✅ |
| Admin calendar + lunch/gap | ✅ |
| Admin website CMS | ✅ |
| Greek i18n + fonts + dates | ✅ |
| Email/password | ✅ |
| Admin route protection | ✅ |
| Google OAuth | ⚠️ needs production credentials — see `deploy/GOOGLE_OAUTH.md` |
| Mercado Pago | ❌ |
| Video (legacy) | ❌ |

---

## Docs

- [docs/PROJECT.md](docs/PROJECT.md) — full reference
- [docs/HOSTING.md](docs/HOSTING.md) — **production hosting (Hetzner)**
- [docs/ADMIN.md](docs/ADMIN.md) — admin calendar + CMS
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — all deploy phases
