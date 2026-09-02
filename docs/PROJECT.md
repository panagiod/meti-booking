# MeTi Pilates — Project reference (for developers & Cursor)

> **Read this first** when continuing work on `panagiod/meti-booking`.  
> Repo name: `meti-booking` (legacy advisory marketplace). **Public product:** **MeTi Pilates** — reformer-only pilates studio booking.

---

## What this app is today

| Area | Current state |
|------|----------------|
| **Product** | Online booking for one pilates studio — **reformer sessions only** |
| **Brand** | **MeTi Pilates** |
| **Customer site** | Homepage hero + `/book` + login + checkout |
| **Languages** | English + Greek (`EN \| ΕΛ`); cookie `flow-locale` |
| **Session** | **Reformer Session** — 50 min, **€45** demo |
| **Currency** | **EUR** (`siteConfig.currency`) |
| **Timezone** | **Europe/Athens** (`STUDIO_TIMEZONE`) |
| **Slot capacity** | **3 bookings per time slot** (3 reformer machines) |
| **Booking window** | **8 weeks ahead** (`bookingWeeksAhead`) |
| **Lead time** | **2 hours** minimum before first bookable slot |
| **Weekly schedule** | **Admin-configurable** — demo seed: Tue, Thu, Sat |
| **Admin calendar** | `/admin/schedule` — days, hours, lunch break, gap, blocked dates |
| **Admin CMS** | `/admin/content` — text, images, contact (DB-backed) |
| **Greek typography** | Noto Sans (body) + GFS Didot (headlines) when `lang="el"` |
| **Greek dates** | Nominative month names (Σεπτέμβριος) via `date-locale.ts` |
| **Security** | Admin server guard, proxy middleware, MP token encryption |
| **Lead time** | **2 hours** minimum before first bookable slot (`booking-config.ts`) |
| **Payments** | Mercado Pago in code — **not on demo**; server-side checkout quotes |
| **Legacy** | Meti advisory marketplace: `/services`, advisor/admin dashboards, LiveKit |

---

## Customer booking flow

```
/  →  Hero  →  /book  →  Date  →  Time  →  Confirm  →  /checkout  →  MP
                                                              ↑
                                                    guest email (no login required)
```

- Reformer auto-selected (no session picker).
- Slots show **remaining spots** or **Full** / **Γεμάτο** (Greek).
- Capacity enforced in `POST /api/appointments` (409 if full, serializable transaction).
- Server validates slot against schedule, blocked times, lead hours, and capacity.
- Demo seed: **Tue/Thu 15:45–18:00** (4 slots), **Sat 08:00–12:45** (7 slots), 45 min classes.
- Calendar shows dates up to **8 weeks** ahead.

---

## Admin features (MeTi Pilates)

| Page | URL | What it manages |
|------|-----|-----------------|
| **Calendar** | `/admin/schedule` | Weekly open days/hours, lunch break, gap, block holidays |
| **Website** | `/admin/content` | Hero copy EN/EL, SEO, images, name, address, email, price |

Full admin guide: **[docs/ADMIN.md](./ADMIN.md)**

Demo admin: `admin@demo.meti-booking.local` / `Demo1234!` (or `DEMO_PASSWORD` env)

---

## Source of truth (by concern)

| Concern | Primary source | Fallback / defaults |
|---------|----------------|---------------------|
| **Live homepage copy** | DB `studio_content` | `src/i18n/locales/{en,el}.ts` |
| **Live images & contact** | DB `studio_content` | `src/lib/site-config.ts` |
| **Booking schedule** | DB `advisor_schedule` | `src/lib/studio-schedule.ts` |
| **Slot capacity** | `siteConfig.slotCapacity` (3) | code only |
| **Booking window** | `siteConfig.bookingWeeksAhead` (8) | code only |
| **Timezone** | `STUDIO_TIMEZONE` env | `Europe/Athens` |
| **Reformer service** | DB `advisor_services` | `scripts/demo-setup.ts` |
| **Code defaults** | `site-config.ts`, locale files | used on first seed |

---

## Key files

### Public site

| File | Purpose |
|------|---------|
| `src/lib/site-config.ts` | EUR, capacity, booking window, reformer filter |
| `src/lib/studio-content.ts` | Content types, defaults, message merge |
| `src/lib/studio-content-server.ts` | DB CRUD for `StudioContent` |
| `src/lib/date-locale.ts` | Greek nominative months for date-fns |
| `src/lib/booking-config.ts` | `resolveBookingLeadHours()`, studio default (2h) |
| `src/components/providers/locale-provider.tsx` | i18n + loads `/api/studio/content` |
| `src/proxy.ts` | Auth middleware + public route allowlist |

### Booking & slots

| File | Purpose |
|------|---------|
| `src/lib/slots.ts` | Slot generation + capacity counting |
| `src/lib/slot-booking.ts` | Server-side slot validation |
| `src/lib/studio-schedule.ts` | Afternoon defaults, demo seed days |
| `src/app/api/slots/route.ts` | Public slots (read-only, no writes on GET) |
| `src/app/api/appointments/route.ts` | Create booking (transactional) |
| `src/app/api/checkout/quote/route.ts` | Server-side pricing (ignores client discount) |

### Security & payments

| File | Purpose |
|------|---------|
| `src/lib/admin-auth.ts` | `requireAdminSession()` |
| `src/lib/encryption.ts` | AES-256-GCM for secrets at rest |
| `src/lib/advisor-mp.ts` | Encrypt/decrypt MP access tokens |
| `src/lib/payment-verify.ts` | Payment amount/reference checks |
| `src/app/(platform)/admin/layout.tsx` | Server-side admin role guard |

### Admin UI

| File | Purpose |
|------|---------|
| `src/app/(platform)/admin/schedule/page.tsx` | Calendar UI (lunch/gap fields) |
| `src/app/(platform)/admin/content/page.tsx` | Website CMS UI |
| `src/app/api/admin/studio/*` | Schedule, content, upload APIs |

---

## Database models (MeTi-relevant)

| Model | Purpose |
|-------|---------|
| `StudioContent` | Singleton CMS: `id="default"`, `data` JSON |
| `AdvisorSchedule` | Weekly hours per `dayOfWeek` (0=Sun), lunch, gap |
| `BlockedTime` | Date ranges excluded from booking |
| `AdvisorService` | Reformer Session — duration, price (EUR cents) |
| `Appointment` | Bookings; capacity by exact `scheduledAt` |
| `AdvisorProfile` | Studio instructor; encrypted `mpAccessToken` |

Optional env: `STUDIO_ADVISOR_ID` — pin instructor for `/api/studio`.

---

## API reference

### Public (no login required)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/studio` | Instructor ID + studio name |
| `GET` | `/api/studio/content` | CMS content for homepage |
| `GET` | `/api/advisors/[id]` | Schedule + reformer services |
| `GET` | `/api/advisors/[id]/mercadopago` | MP connection status |
| `GET` | `/api/slots` | Slots with capacity + blocked times |
| `GET` | `/api/checkout/quote` | Server-side price breakdown |
| `GET` | `/api/services` | Service catalog (legacy) |
| `GET` | `/api/promotions` | Active promotions |
| `POST` | `/api/auth/*` | better-auth |

### Authenticated

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/appointments` | Create booking (session required) |

### Admin (require `role === ADMIN`)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET/PUT` | `/api/admin/studio/schedule` | Weekly hours |
| `GET/POST/DELETE` | `/api/admin/studio/blocked-times` | Block dates |
| `GET/PUT` | `/api/admin/studio/content` | Website CMS (strict parse) |
| `POST` | `/api/admin/studio/upload` | Image upload (blob required in prod) |
| `GET` | `/api/admin/studio` | Calendar page data |

> **Important:** `/api/advisors` and `/api/services` must stay on the proxy public allowlist or `/book` breaks for guests.

---

## Internationalization

| Piece | Detail |
|-------|--------|
| Locales | `en`, `el` |
| Cookie | `flow-locale` |
| Provider | `LocaleProvider` in root layout |
| Hooks | `useTranslations()`, `useStudioBranding()`, `useLocale()` |
| Greek fonts | `html[lang="el"]` → Noto Sans body, GFS Didot display |
| Greek dates | Nominative months (Σεπτέμβριος) — `src/lib/date-locale.ts` |
| Auto-detect | `navigator.language` starting with `el` → Greek |

**Customer pages translated:** homepage, `/book`, auth, checkout, client dashboard nav.  
**Admin/advisor dashboards:** English only.

---

## Slot capacity & schedule

1. `siteConfig.slotCapacity = 3`
2. Demo seed: **Mon/Wed/Sat 14:00–17:00**, gap 10 min → **3 slots/day**
3. `GET /api/slots` — counts appointments, applies blocked times (read-only)
4. `POST /api/appointments` — serializable transaction, 409 when full
5. All slot times interpreted in **Europe/Athens**
6. Booking horizon: **8 weeks** (`siteConfig.bookingWeeksAhead`)

Tests: `tests/unit/slots.test.ts`, `tests/unit/studio-schedule.test.ts`, `tests/unit/timezone.test.ts`, `tests/unit/date-locale.test.ts`

---

## Demo accounts

Password: **`Demo1234!`** locally (override with `DEMO_PASSWORD`; not printed in production)

| Role | Email | Use |
|------|-------|-----|
| Client | `client@demo.meti-booking.local` | Book at `/book` |
| Instructor | `instructor@meti-pilates.studio` | `/advisor` |
| Admin | `admin@demo.meti-booking.local` | `/admin/schedule`, `/admin/content` |

### `pnpm demo:setup` seeds

- Users (admin, instructor, client)
- One service: **Reformer Session** (50 min, €45)
- Schedule: **Mon/Wed/Sat 14:00–17:00**
- **`studio_content`** row with default EN/EL copy and images
- Pilates category + instructor link

### Flags

| Flag | Effect |
|------|--------|
| `--reset` | Re-seed schedule + services (keeps CMS) |
| `--reset-content` | Reset website CMS to defaults |

Production requires `ALLOW_DEMO_SEED=1` and `DEMO_PASSWORD`.

---

## Environment variables

Copy `.env.demo.example` → `.env`. See `.env.example` for production.

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL |
| `BETTER_AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | Public URL, no trailing slash |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | Same |
| `STUDIO_TIMEZONE` | ⚠️ | Default `Europe/Athens` |
| `ENCRYPTION_KEY` | ✅ prod | MP token encryption; `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | Vercel prod | Admin image uploads on Vercel |
| `SELF_HOSTED` | VPS prod | Set `1` on Hetzner — local disk uploads instead of Blob |
| `CRON_SECRET` | ✅ prod | Cron endpoints fail-closed without it |
| `GOOGLE_CLIENT_ID/SECRET` | Optional | See `deploy/GOOGLE_OAUTH.md` |
| `APP_URL` | ⚠️ | MP webhooks |
| `DEMO_PASSWORD` | prod seed | Required with `ALLOW_DEMO_SEED=1` |
| `ALLOW_DEMO_SEED` | prod seed | Set to `1` to allow `demo:setup` in production |
| `STUDIO_ADVISOR_ID` | ❌ | Optional instructor pin |

### Production hosting

| Platform | Guide |
|----------|-------|
| **Hetzner VPS (recommended)** | [deploy/HETZNER.md](../deploy/HETZNER.md) · [docs/HOSTING.md](./HOSTING.md) |
| Vercel Pro | [deploy/VERCEL.md](../deploy/VERCEL.md) |
| Cost comparison | [docs/CHEAPEST_HOSTING.md](./CHEAPEST_HOSTING.md) |

---

## Commands

```bash
docker compose up -d
cp .env.demo.example .env
pnpm install
pnpm demo:setup          # migrate + seed everything
pnpm dev                 # http://localhost:3000

pnpm build && pnpm start
pnpm test:unit
pnpm test:e2e

pnpm exec tsx scripts/generate-brand-assets.ts
pnpm exec tsx scripts/reset-studio-schedule.ts   # Mon/Wed/Sat 14:00–17:00
```

---

## Key routes

### Customer

| Route | Description |
|-------|-------------|
| `/` | Homepage hero |
| `/book` | Booking wizard |
| `/login`, `/register` | Auth |
| `/checkout`, `/checkout/result` | Payment |
| `/dashboard/*` | Client bookings |

### Admin (MeTi)

| Route | Description |
|-------|-------------|
| `/admin/schedule` | Calendar management |
| `/admin/content` | Website CMS |

### Legacy

| Route | Description |
|-------|-------------|
| `/services`, `/advisor/[id]` | Original Meti marketplace |
| `/advisor/schedule`, etc. | Advisor dashboard (auth required) |
| `/call/[id]` | LiveKit video |

---

## Known issues & roadmap

| Topic | Status |
|-------|--------|
| Google OAuth | ✅ Implemented — set real credentials (see `deploy/GOOGLE_OAUTH.md`) |
| Payments | MP not configured on demo |
| Stripe / Revolut | Issues #2–#7 |
| Permanent hosting | #10 |
| Guest checkout | ✅ Done (`guest-user.ts`, checkout email form) |
| Batch slots API | ✅ Done (`GET /api/slots/batch`) |
| Admin/advisor UI Greek | Not translated |
| Timezone Europe/Athens | ✅ Done |
| Server slot validation | ✅ Done |
| Booking lead time (2h) | ✅ Done (`booking-config.ts`) |
| Server checkout quote | ✅ Done (`/book` summary + checkout) |
| MP token encryption | ✅ Done |
| Admin route guard | ✅ Done |
| EUR currency | ✅ Done |
| Greek nominative months | ✅ Done |
| OG image | ✅ Done |
| Admin CMS | ✅ `/admin/content` |
| Admin calendar | ✅ `/admin/schedule` |

### GitHub issues

**Fixed (close with `./scripts/close-resolved-issues.sh`):** #1, #8, #9, #11–#31 — see [RESOLVED_ISSUES.md](./RESOLVED_ISSUES.md).

**Still open:** #2–#7 (payments/OAuth), #10 (permanent deploy).

### Recent commits (Aug 2026)

| Commit | Change |
|--------|--------|
| `8ebf9d6` | Standardize `bookingLeadHours` to 2h |
| `8c33ca4` | Booking summary uses server checkout quote |
| `6059a06` | Docs sync (audit batch) |
| `a09d577` | Greek nominative month names |
| `40ec61f` | Public `/api/advisors` + `/api/services` |
| `2025a7b` | EUR, MP encryption, admin guard, CMS/blob/demo |
| `84cd32c` | Bootstrap auth, payment verify, checkout quotes |
| `73aaf61` | Timezone, slot validation, 8-week horizon |

---

## Cursor continuation checklist

1. Read **`docs/PROJECT.md`** + **`docs/ADMIN.md`**.
2. `git pull` on `main`.
3. `docker compose up -d` → `.env` → `pnpm install` → `pnpm demo:setup` → `pnpm dev`.
4. **Scope:** reformer-only public site unless asked otherwise.
5. **Lead time:** use `resolveBookingLeadHours()` from `booking-config.ts` (default 2h).
6. **Pricing:** use `GET /api/checkout/quote` — never hardcode fees client-side.
7. **Timezone:** always use `src/lib/timezone.ts` — never raw `Date` for slot logic.
8. **Public APIs:** keep `/api/advisors`, `/api/slots`, `/api/studio` on proxy allowlist.
9. **Close fixed issues:** `./scripts/close-resolved-issues.sh` after verifying on `main`.

---

## Related docs

| Doc | Contents |
|-----|----------|
| [README.md](../README.md) | Quick start |
| [ADMIN.md](./ADMIN.md) | **Admin calendar + CMS guide** |
| [DEMO.md](./DEMO.md) | Local demo walkthrough |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deploy |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | OAuth, payments, images |
| [RESOLVED_ISSUES.md](./RESOLVED_ISSUES.md) | **Audit fixes + issue tracker** |
| [DEPLOYMENT_STATUS.md](../DEPLOYMENT_STATUS.md) | Live demo URL |
| [AGENTS.md](../AGENTS.md) | Cursor agent notes |
