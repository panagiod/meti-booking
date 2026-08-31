# MeTi Pilates Booking

**Reformer pilates studio booking** — built on the [meti-booking](https://github.com/panagiod/meti-booking) stack (Next.js 16, Prisma, better-auth).

Customers book **reformer sessions only** online: pick a date, pick a time, sign in, pay.  
Bilingual: **English + Greek** (`EN | ΕΛ`).

> 📖 **Full project reference for Cursor / developers:** [docs/PROJECT.md](docs/PROJECT.md)

---

## Quick facts

| | |
|---|---|
| **Brand** | MeTi Pilates |
| **Public site** | Homepage + `/book` |
| **Session** | Reformer only (50 min) |
| **Capacity** | 3 spots per time slot |
| **Demo password** | `Demo1234!` |
| **Client login** | `client@demo.meti-booking.local` |
| **Instructor** | `instructor@meti-pilates.studio` |

---

## Quick start (local)

```bash
docker compose up -d
cp .env.demo.example .env
pnpm install
pnpm demo:setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → **Book** → complete the flow.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm demo:setup` | Migrate DB + seed reformer studio demo |
| `pnpm test:unit` | Vitest unit tests |
| `pnpm test:e2e` | Playwright E2E |

---

## Tech stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **PostgreSQL** + Prisma 7
- **better-auth** (email + Google OAuth)
- **Mercado Pago** (checkout — migration to Stripe/Revolut planned)
- **Tailwind CSS 4** + custom `studio.css` for public pages

---

## Project structure (customer-facing)

```
src/
  lib/site-config.ts          # Studio branding, slotCapacity, images
  i18n/locales/{en,el}.ts     # Translations
  app/(marketing)/
    page.tsx                  # Homepage (hero only)
    book/page.tsx             # Booking flow
  components/landing/         # Navbar, hero, footer
  components/booking/         # Calendar, time slots, summary
public/images/                # Local reformer photos
```

Legacy advisor/admin/marketplace code lives under `src/app/(platform)/` and `/services`.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [**docs/PROJECT.md**](docs/PROJECT.md) | **Complete reference** — architecture, i18n, slots, demo, env, roadmap |
| [docs/DEMO.md](docs/DEMO.md) | Local demo walkthrough |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy to Render / Vercel |
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | Google OAuth, payments, images |
| [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) | Ephemeral live demo URL |

---

## Configuration

Studio settings: **`src/lib/site-config.ts`**

```ts
name: "MeTi Pilates"
slotCapacity: 3
images: { hero: "/images/hero.jpg", reformer: "/images/reformer.jpg" }
```

---

## License

MIT — see [LICENSE](LICENSE).
