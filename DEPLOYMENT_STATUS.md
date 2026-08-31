# Live demo status — MeTi Pilates

> Ephemeral Cloudflare tunnel — **only works while the Cursor cloud VM is running.**

## Public URLs (when VM + server are up)

| Page | URL |
|------|-----|
| Homepage | https://sin-building-cardiovascular-lifetime.trycloudflare.com |
| Book | https://sin-building-cardiovascular-lifetime.trycloudflare.com/book |

If the link returns **502**, the Next.js server stopped — restart with:

```bash
cd /workspace
pnpm build
export $(grep -v '^#' .env | xargs) && pnpm start
```

Tunnel process: `cloudflared tunnel --url http://localhost:3000`

---

## What the demo shows

- **MeTi Pilates** homepage — single hero: "Book your session." / "Κλείστε το μάθημά σας."
- **Reformer-only** booking at `/book` (date → time → confirm)
- **3 spots per time slot** — full slots shown as disabled
- **EN | ΕΛ** language switcher
- Local reformer pilates images (`/public/images/`)

---

## Demo accounts

Password: **`Demo1234!`**

| Role | Email |
|------|-------|
| Client | `client@demo.meti-booking.local` |
| Instructor | `instructor@meti-pilates.studio` |
| Admin | `admin@demo.meti-booking.local` |

---

## What works / what doesn't

| Feature | Demo |
|---------|------|
| Homepage + booking UI | ✅ |
| Email/password login | ✅ |
| Greek translations (customer pages) | ✅ |
| Slot capacity (3 per time) | ✅ |
| Google OAuth | ❌ placeholder credentials |
| Mercado Pago checkout | ❌ instructor MP not connected |
| Video calls (legacy) | ❌ needs LiveKit |

---

## Permanent hosting

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and `render.yaml` (Render one-click deploy).

After deploy, set `BETTER_AUTH_URL`, `APP_URL`, run `pnpm demo:setup` with production URL.
