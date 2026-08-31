# MeTi Pilates Booking

**Reformer pilates studio booking** — [meti-booking](https://github.com/panagiod/meti-booking) stack (Next.js 16, Prisma, better-auth).

Book **reformer sessions** online: pick a date, time, sign in, pay.  
**English + Greek** (`EN | ΕΛ`).

> 📖 **Full reference:** [docs/PROJECT.md](docs/PROJECT.md) · **Admin guide:** [docs/ADMIN.md](docs/ADMIN.md)

---

## Quick facts

| | |
|---|---|
| **Brand** | MeTi Pilates |
| **Public site** | Homepage + `/book` |
| **Schedule** | Mon, Wed, Sat · 2pm–5pm (demo seed; admin-editable) |
| **Booking window** | 8 weeks ahead |
| **Capacity** | 3 clients per time slot |
| **Currency** | EUR (€) |
| **Timezone** | Europe/Athens |
| **Languages** | EN + ΕΛ (Noto Sans / GFS Didot for Greek) |
| **Demo password** | `Demo1234!` (or `DEMO_PASSWORD` env) |
| **Admin** | `admin@demo.meti-booking.local` |

---

## Quick start

```bash
docker compose up -d
cp .env.demo.example .env
pnpm install
pnpm demo:setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → **Book**.

---

## Admin (studio owner)

| Page | URL | Purpose |
|------|-----|---------|
| **Calendar** | [/admin/schedule](http://localhost:3000/admin/schedule) | Open days, hours, lunch breaks, block holidays |
| **Website** | [/admin/content](http://localhost:3000/admin/content) | Hero text, images, contact info |

See [docs/ADMIN.md](docs/ADMIN.md) for details.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production |
| `pnpm demo:setup` | Migrate + seed DB (users, schedule, CMS content) |
| `pnpm demo:setup -- --reset` | Re-seed schedule + services (keeps CMS) |
| `pnpm demo:setup -- --reset-content` | Reset website CMS to defaults |
| `pnpm test:unit` | Vitest |
| `pnpm test:e2e` | Playwright |
| `pnpm exec tsx scripts/generate-brand-assets.ts` | Regenerate favicons + OG image |
| `pnpm exec tsx scripts/reset-studio-schedule.ts` | Reset schedule to Mon/Wed/Sat 14:00–17:00 |

---

## Tech stack

- Next.js 16 · React 19 · TypeScript
- PostgreSQL · Prisma 7
- better-auth
- Tailwind 4 · `studio.css`
- DB-backed CMS (`StudioContent` model)
- Mercado Pago (optional; EUR checkout)

---

## Project structure

```
src/
  app/(marketing)/       # Homepage, /book
  app/(platform)/admin/  # schedule, content, …
  lib/
    site-config.ts       # Code defaults (EUR, capacity, booking window)
    studio-content*.ts   # CMS logic
    studio-schedule.ts   # Calendar defaults
    timezone.ts          # Europe/Athens slot times
    date-locale.ts       # Greek nominative month names
    proxy.ts             # Auth middleware (public routes)
  i18n/locales/          # EN + EL copy (fallbacks)
  components/landing/    # Hero, navbar, footer
public/images/           # Default photos
public/uploads/studio/   # Admin-uploaded images (local dev)
```

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [**docs/PROJECT.md**](docs/PROJECT.md) | Complete architecture & API reference |
| [**docs/ADMIN.md**](docs/ADMIN.md) | Calendar + website CMS |
| [docs/DEMO.md](docs/DEMO.md) | Demo walkthrough |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy to Vercel / VPS |
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | OAuth, payments, images |
| [AGENTS.md](AGENTS.md) | Cursor / CI notes |

---

## License

MIT — see [LICENSE](LICENSE).
