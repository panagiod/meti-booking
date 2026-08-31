# MeTi Pilates — Project reference (for developers & Cursor)

> **Read this first** when continuing work on `panagiod/meti-booking`.  
> The repo name is still `meti-booking` (original advisory marketplace); the **public customer site** is branded **MeTi Pilates** — a reformer-only pilates studio booking app.

---

## What this app is today

| Area | Current state |
|------|----------------|
| **Product** | Online booking for a single pilates studio — **reformer sessions only** |
| **Brand** | **MeTi Pilates** (`src/lib/site-config.ts`) |
| **Customer site** | Homepage hero + `/book` flow + login/register + checkout |
| **Languages** | English + Greek (`EN \| ΕΛ` switcher); cookie `flow-locale` |
| **Session type** | One service: **Reformer Session** (50 min, €45 demo price) |
| **Slot capacity** | **3 bookings per time slot** (3 reformer machines) |
| **Weekly schedule** | **3 days/week** (Tue, Thu, Sat) · **3 afternoon hours** (2pm–5pm) → 3 slots/day |
| **Admin calendar** | `/admin/schedule` — manage weekly hours + block dates |
| **Payments** | Mercado Pago Checkout Pro in code — **not configured on demo**; planned migration to Stripe/Revolut (see GitHub issues) |
| **Legacy code** | Original Meti advisory platform still in repo: `/services`, advisor/admin dashboards, LiveKit video, multi-category marketplace |

---

## Customer booking flow

```
/  →  Hero ("Book your session.")  →  /book
/book  →  Date  →  Time  →  Confirm  →  /login (if needed)  →  /checkout  →  Mercado Pago
```

- No session-type picker — reformer is auto-selected.
- Time slots show **remaining spots** (e.g. "2 left") or **Full** when 3 are booked.
- Server enforces capacity in `POST /api/appointments` (409 if full).

---

## Source of truth files

| File | Purpose |
|------|---------|
| `src/lib/site-config.ts` | Studio name, email, hours, **slotCapacity: 3**, image paths, reformer-only helpers |
| `src/i18n/locales/en.ts` | English copy |
| `src/i18n/locales/el.ts` | Greek copy |
| `src/styles/studio.css` | Public site design tokens + `.studio-container` |
| `scripts/demo-setup.ts` | Seeds DB: one instructor, one **Reformer Session** service, weekly schedule |
| `src/app/api/studio/route.ts` | Returns primary instructor for `/book` |
| `src/lib/slots.ts` | Slot generation + **capacity counting** |
| `public/images/hero.jpg` | Reformer pilates hero (bundled, Pexels) |
| `src/lib/studio-schedule.ts` | 3-day/week defaults, validation, slot preview |
| `src/lib/studio-advisor.ts` | Resolve studio instructor for booking + admin |
| `src/app/api/admin/studio/*` | Admin calendar APIs (schedule + blocked times) |

### Reformer-only filtering

- `isReformerService()` in `site-config.ts` — excludes mat/duo/private/group names.
- `GET /api/advisors/[id]` filters services to reformer only for public API.

---

## Homepage (marketing)

- **Single section only** — `Hero` component (`src/components/landing/hero.tsx`).
- Removed: second session card, "Ready to move?" CTA block, `#sessions` nav link.
- Hero copy:
  - **EN title:** `Book your session.`
  - **EL title:** `Κλείστε το μάθημά σας.`
  - Eyebrow: `Reformer pilates`
- Layout: `studio-container`, mobile-first (image on top on small screens).

---

## Internationalization (i18n)

- Provider: `LocaleProvider` in **root** `src/app/layout.tsx` (app-wide).
- Marketing layout: `src/app/(marketing)/layout.tsx` — Navbar + Footer only.
- Translated: homepage, `/book`, login/register, checkout, checkout result, client dashboard nav.
- **Not translated:** admin/advisor dashboards, legal pages, legacy `/services`.
- Browser language: auto-detects Greek (`el`) on first visit if `navigator.language` starts with `el`.

---

## Slot capacity (3 per time)

1. `siteConfig.slotCapacity = 3`
2. `generateAvailableSlots(..., slotCapacity)` returns `{ time, available, booked, capacity, remaining }`
3. `GET /api/slots` passes capacity from `siteConfig`
4. `POST /api/appointments` uses a **transaction** to count bookings at exact `scheduledAt` and reject if `>= 3`
5. `TimeSlotPicker` shows all slots; full slots are disabled with "Full" / "Πλήρες"

Unit tests: `tests/unit/slots.test.ts`

---

## Images

- **Do not use external Unsplash URLs** — many old IDs return 404.
- Images are **local**: `/public/images/hero.jpg`, `reformer.jpg` (reformer pilates photos from Pexels).
- `next.config.ts`: `images.unoptimized: true` — required for standalone/Cloudflare tunnel deploys (`/_next/image` 404 otherwise).

---

## Demo accounts

Password for all: **`Demo1234!`**

| Role | Email | Dashboard |
|------|-------|-----------|
| Client | `client@demo.meti-booking.local` | `/dashboard` |
| Instructor | `instructor@meti-pilates.studio` | `/advisor` |
| Admin | `admin@demo.meti-booking.local` | `/admin` |

### Demo data (`pnpm demo:setup`)

- Deletes instructor services and creates **one** service: `Reformer Session` (50 min, 4500 cents = €45).
- Instructor schedule: Mon–Fri 6:00–20:00 (lunch 12–13), Sat 8:00–14:00.
- Categories seeded include Pilates (legacy multi-category system).

---

## Environment variables

Copy `.env.demo.example` → `.env` for local dev.

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL (Docker Compose locally) |
| `BETTER_AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | Public app URL (no trailing slash) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | Same as above |
| `GOOGLE_CLIENT_ID` / `SECRET` | ⚠️ | Placeholder on demo — Google login fails until real OAuth |
| `APP_URL` | ⚠️ | Used for MP webhooks/redirects |
| `MERCADOPAGO_*` | ❌ demo | Per-instructor via advisor dashboard |
| `LIVEKIT_*` | ❌ demo | Video calls (legacy advisory feature) |

When public URL changes (new tunnel/domain), update `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `APP_URL`, and Google OAuth redirect URIs.

---

## Commands

```bash
docker compose up -d          # PostgreSQL
cp .env.demo.example .env
pnpm install
pnpm demo:setup               # migrate + seed + demo users
pnpm dev                      # http://localhost:3000

pnpm build && pnpm start      # production (after build)
pnpm test:unit
pnpm test:e2e                 # needs test DB
```

### Cloud demo (Cursor VM)

```bash
pnpm build
export $(grep -v '^#' .env | xargs) && pnpm start
# Separate terminal: cloudflared tunnel --url http://localhost:3000
```

Tunnel URL is **ephemeral** (`*.trycloudflare.com`) — dies when VM stops. See `DEPLOYMENT_STATUS.md`.

---

## Key routes

### Customer-facing (MeTi Pilates)

| Route | Description |
|-------|-------------|
| `/` | Homepage hero |
| `/book` | Booking wizard |
| `/login`, `/register` | Auth |
| `/checkout` | Payment summary |
| `/checkout/result` | Post-payment status |
| `/dashboard/*` | Client bookings (auth required) |
| `/admin/schedule` | **Studio calendar** — weekly hours + blocked dates (admin) |

### Legacy / instructor / admin (original Meti)

| Route | Description |
|-------|-------------|
| `/services` | Advisor marketplace listing |
| `/advisor/[id]` | Old booking flow with service picker |
| `/advisor/*` | Instructor dashboard |
| `/admin/*` | Platform admin |
| `/call/[appointmentId]` | LiveKit video (advisory) |

---

## Architecture notes

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **DB:** PostgreSQL + Prisma 7 (`src/generated/prisma`)
- **Auth:** better-auth (email/password + Google OAuth)
- **Styling:** Tailwind 4 + `studio.css` for public pages; legacy orange/blue theme on platform dashboards
- **Timezone:** App slots use Colombia UTC-5 helpers in `src/lib/timezone.ts` (legacy — consider Europe/Athens for Greece studio)
- **Currency:** Customer `formatMoney()` uses **EUR** (`src/lib/format.ts`); some advisor/admin pages still show COP from original Meti

---

## Known issues & GitHub issues

| Topic | Status |
|-------|--------|
| Google OAuth | Placeholder credentials — use email/password on demo |
| Payments | MP not connected — checkout shows "Payment unavailable" |
| Stripe / Revolut + Apple/Google Pay | Planned (#2, #4, #5, #6, #7) |
| Permanent hosting | #10 — Render blueprint in `render.yaml` |
| OG image | ✅ MeTi Pilates reformer hero (`opengraph-image.tsx` + `public/og-image.png`) |
| Guest checkout | #8 — not implemented |
| Full Greek | Dashboard/legal pages still English |

---

## Deployment

- **Render:** `render.yaml` — free web + Postgres; set `BETTER_AUTH_URL` after deploy, run `pnpm demo:setup`
- **Vercel + Neon:** see `docs/DEPLOYMENT.md`
- **Temporary tunnel:** Cloudflare `trycloudflare.com` for Cursor demos only

After deploy: `pnpm build`, `pnpm start` (note: `output: standalone` in `next.config.ts` — `pnpm start` works but logs a standalone warning).

---

## Making common changes

### Rename studio / copy

1. `src/lib/site-config.ts` — `name`, `email`, `location`, etc.
2. `src/i18n/locales/en.ts` + `el.ts` — hero, nav, booking, checkout strings
3. `public/manifest.json`
4. `src/app/layout.tsx` — metadata

### Change slot capacity

1. `siteConfig.slotCapacity` in `site-config.ts`
2. Already wired through slots API + appointments POST

### Add language

1. Add locale in `src/i18n/types.ts` + new locale file
2. Register in `src/i18n/index.ts`
3. Add to `LanguageSwitcher`

### Change reformer price/duration

1. `scripts/demo-setup.ts` — service seed
2. Re-run `pnpm demo:setup`
3. `site-config.ts` `sessionTypes[0].priceFrom` for display on hero

---

## Project history (for context)

1. Started as **Meti** — online advisory marketplace (video calls, multi-category advisors).
2. Rebranded public site to **Flow Pilates** (demo).
3. Simplified to **reformer-only**, Greek i18n, mobile layout, 3-slot capacity.
4. Renamed to **MeTi Pilates**; homepage reduced to single hero section.
5. Payments migration to Stripe/Revolut requested but not implemented yet.

---

## Repository

| | |
|---|---|
| **GitHub** | https://github.com/panagiod/meti-booking |
| **Default branch** | `main` |
| **Package name** | `meti-booking` (npm) |
| **Node** | `>=20` (see `package.json` engines) |
| **Package manager** | pnpm 9+ |

### Open GitHub issues (roadmap)

| # | Title | Notes |
|---|-------|-------|
| [#1](https://github.com/panagiod/meti-booking/issues/1) | Fix image loading on standalone/tunnel | **Likely done** — local images + `images.unoptimized: true` |
| [#2](https://github.com/panagiod/meti-booking/issues/2) | Epic: Replace Mercado Pago | Parent epic for payments |
| [#3](https://github.com/panagiod/meti-booking/issues/3) | Google OAuth for production | Placeholder creds on demo |
| [#4](https://github.com/panagiod/meti-booking/issues/4) | Stripe + Apple/Google Pay | |
| [#5](https://github.com/panagiod/meti-booking/issues/5) | Revolut Pay | |
| [#6](https://github.com/panagiod/meti-booking/issues/6) | Remove Mercado Pago / COP logic | |
| [#7](https://github.com/panagiod/meti-booking/issues/7) | Checkout refactor for Stripe Payment Element | |
| [#8](https://github.com/panagiod/meti-booking/issues/8) | Guest checkout | No forced login |
| [#9](https://github.com/panagiod/meti-booking/issues/9) | EUR pricing in advisor/admin UI | Customer site already EUR |
| [#10](https://github.com/panagiod/meti-booking/issues/10) | Permanent domain (Render) | `render.yaml` exists |

---

## API endpoints (customer booking)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/studio` | Primary instructor ID for `/book` (pilates category or `STUDIO_ADVISOR_ID`) |
| `GET` | `/api/advisors/[id]` | Instructor profile + schedule; **filters services to reformer only** |
| `GET` | `/api/slots?advisorId=&date=&serviceId=` | Time slots with `booked`, `capacity`, `remaining` |
| `POST` | `/api/appointments` | Create booking; **409 if slot full** (transactional capacity check) |
| `POST` | `/api/auth/*` | better-auth (login, register, Google OAuth) |

Checkout/payment (legacy MP):

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/webhooks/mercadopago` | Payment webhook |
| `GET/POST` | `/api/advisor/mercadopago` | Instructor MP credentials |

---

## Database (booking-relevant models)

Prisma schema: `prisma/schema.prisma` — client generated to `src/generated/prisma`.

| Model | Role in MeTi Pilates |
|-------|----------------------|
| `User` | Roles: `CLIENT`, `ADVISOR`, `ADMIN` |
| `AdvisorProfile` | Studio instructor; `bookingLeadHours`, schedule, services |
| `AdvisorService` | **Reformer Session** — `durationMin`, `priceCents` |
| `AdvisorSchedule` | Weekly hours per `dayOfWeek` (0=Sun), lunch break, `gapMinutes` |
| `Appointment` | Booking at `scheduledAt`; capacity counted by exact timestamp |
| `Category` | Legacy marketplace; demo uses `pilates` slug for studio lookup |

**Capacity logic:** multiple `Appointment` rows can share the same `scheduledAt` + `advisorId` until `siteConfig.slotCapacity` (3) is reached.

Optional env: `STUDIO_ADVISOR_ID` — pin which instructor `/api/studio` returns.

---

## i18n implementation

| Piece | Location |
|-------|----------|
| Locales | `en`, `el` in `src/i18n/locales/` |
| Types | `src/i18n/types.ts` — `Messages` interface, all keys typed |
| Cookie / storage key | `flow-locale` (`LOCALE_COOKIE`) — legacy name from Flow Pilates |
| Provider | `src/components/providers/locale-provider.tsx` — root `layout.tsx` |
| Hooks | `useTranslations()`, `useLocale()`, `formatMessage()` |
| Switcher | `src/components/landing/language-switcher.tsx` (navbar, auth, checkout) |
| Auto-detect | `navigator.language` starting with `el` → Greek on first visit |

**Add copy:** edit both `en.ts` and `el.ts`; TypeScript enforces matching keys.

---

## App directory map

```
src/app/
  (marketing)/           # MeTi Pilates public site
    layout.tsx           # Navbar + Footer
    page.tsx             # Homepage — Hero only
    book/page.tsx        # Date → time → confirm wizard
    login/, register/
    checkout/, checkout/result/
  (platform)/            # Legacy Meti dashboards
    dashboard/           # Client
    advisor/             # Instructor
    admin/               # Platform admin
    services/            # Marketplace listing
  api/                   # Route handlers (see table above)
src/components/
  landing/               # hero, navbar, footer, language-switcher
  booking/               # calendar-picker, time-slot-picker, booking-summary
  providers/             # locale-provider
src/lib/
  site-config.ts         # Branding + slotCapacity
  slots.ts               # Slot generation + capacity
  timezone.ts            # Legacy Colombia UTC-5 helpers
  format.ts              # EUR money formatting (customer)
  auth.ts, auth-client.ts
public/images/           # hero.jpg, reformer.jpg
scripts/
  demo-setup.ts          # Migrate + seed demo studio
  seed-categories.ts
tests/unit/slots.test.ts
```

---

## Cursor continuation checklist

When resuming work in a new Cursor session:

1. **Read** this file (`docs/PROJECT.md`) and `DEPLOYMENT_STATUS.md` for live demo URL.
2. **Clone / pull** `panagiod/meti-booking` on `main`.
3. **Start stack:** `docker compose up -d` → `cp .env.demo.example .env` → `pnpm install` → `pnpm demo:setup` → `pnpm dev`.
4. **Public product scope:** reformer-only customer site — do not re-add mat/duo/private without explicit request.
5. **Copy changes:** always update `site-config.ts` + `en.ts` + `el.ts` together.
6. **Images:** keep local under `public/images/`; keep `images.unoptimized: true` for tunnel deploys.
7. **After schema changes:** `pnpm db:migrate` + `pnpm demo:setup` if seed affected.
8. **Tunnel demo:** `pnpm build && pnpm start` + `cloudflared tunnel --url http://localhost:3000`; update `BETTER_AUTH_URL` / `APP_URL` when URL changes.
9. **Payments:** MP is legacy; user wants Stripe/Revolut — see issues #2–#7.
10. **PR workflow:** use branches + PRs; CI runs unit + E2E tests.

### Recent milestone commits (Aug 2026)

| Commit | Change |
|--------|--------|
| `3869e1a` | Single-section homepage (hero only) |
| `6307115` | Rebrand Flow Pilates → MeTi Pilates |
| `edd57de` | Hero headline → "Book your session." / "Κλείστε το μάθημά σας." |

Earlier work (same sprint): reformer-only filter, Greek i18n, 3-slot capacity, local images, mobile layout.

---

## Related docs

| Doc | Contents |
|-----|----------|
| [README.md](../README.md) | Quick start + overview |
| [DEMO.md](./DEMO.md) | Local demo setup |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deploy options |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | Google OAuth, payments, images |
| [DEPLOYMENT_STATUS.md](../DEPLOYMENT_STATUS.md) | Current live demo URL (if VM running) |
| [AGENTS.md](../AGENTS.md) | CI, PR workflow, Cursor notes |
