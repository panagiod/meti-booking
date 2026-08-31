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
| **Session** | **Reformer Session** — 50 min, €45 demo |
| **Slot capacity** | **3 bookings per time slot** (3 reformer machines) |
| **Weekly schedule** | **Tue, Thu, Sat** · **2pm–5pm** → 3 slots/day |
| **Admin calendar** | `/admin/schedule` — hours + blocked dates |
| **Admin CMS** | `/admin/content` — text, images, contact (DB-backed) |
| **Greek typography** | Noto Sans (body) + GFS Didot (headlines) when `lang="el"` |
| **OG / favicons** | Reformer hero image + MeTi branding |
| **Payments** | Mercado Pago in code — **not on demo**; Stripe/Revolut planned (#2–#7) |
| **Legacy** | Meti advisory marketplace: `/services`, advisor/admin dashboards, LiveKit |

---

## Customer booking flow

```
/  →  Hero  →  /book  →  Date  →  Time  →  Confirm  →  /login  →  /checkout  →  MP
```

- Reformer auto-selected (no session picker).
- Slots show **remaining spots** or **Full** / **Γεμάτο** (Greek).
- Capacity enforced in `POST /api/appointments` (409 if full).
- Only **Tue/Thu/Sat afternoons** bookable (configurable in admin calendar).

---

## Admin features (MeTi Pilates)

| Page | URL | What it manages |
|------|-----|-----------------|
| **Calendar** | `/admin/schedule` | Weekly open days/hours (max 3 days), block holidays |
| **Website** | `/admin/content` | Hero copy EN/EL, SEO, images, name, address, email, price |

Full admin guide: **[docs/ADMIN.md](./ADMIN.md)**

Demo admin: `admin@demo.meti-booking.local` / `Demo1234!`

---

## Source of truth (by concern)

| Concern | Primary source | Fallback / defaults |
|---------|----------------|---------------------|
| **Live homepage copy** | DB `studio_content` | `src/i18n/locales/{en,el}.ts` |
| **Live images & contact** | DB `studio_content` | `src/lib/site-config.ts` |
| **Booking schedule** | DB `advisor_schedule` | `src/lib/studio-schedule.ts` |
| **Slot capacity** | `siteConfig.slotCapacity` (3) | code only |
| **Reformer service** | DB `advisor_services` | `scripts/demo-setup.ts` |
| **Code defaults** | `site-config.ts`, locale files | used on first seed |

---

## Key files

### Public site

| File | Purpose |
|------|---------|
| `src/lib/site-config.ts` | Code defaults: capacity, reformer filter, fallback branding |
| `src/lib/studio-content.ts` | Content types, defaults, message merge |
| `src/lib/studio-content-server.ts` | DB CRUD for `StudioContent` |
| `src/components/providers/locale-provider.tsx` | i18n + loads `/api/studio/content` |
| `src/components/landing/hero.tsx` | Homepage — uses `useTranslations()` + `useStudioBranding()` |
| `src/i18n/locales/en.ts`, `el.ts` | Static translation defaults |
| `src/styles/studio.css` | Design tokens + Greek font rules |
| `public/images/hero.jpg`, `reformer.jpg` | Default bundled photos |

### Booking & slots

| File | Purpose |
|------|---------|
| `src/lib/slots.ts` | Slot generation + capacity counting |
| `src/lib/studio-schedule.ts` | 3-day/week validation, afternoon defaults |
| `src/lib/studio-advisor.ts` | Resolve studio instructor |
| `src/app/api/slots/route.ts` | Public slots (+ blocked times) |
| `src/app/api/appointments/route.ts` | Create booking (transactional capacity) |

### Admin

| File | Purpose |
|------|---------|
| `src/app/(platform)/admin/schedule/page.tsx` | Calendar UI |
| `src/app/(platform)/admin/content/page.tsx` | Website CMS UI |
| `src/app/api/admin/studio/*` | Schedule, content, upload APIs |

### Assets & branding

| File | Purpose |
|------|---------|
| `src/app/opengraph-image.tsx` | Dynamic OG image (hero photo + copy) |
| `scripts/generate-brand-assets.ts` | Regenerate favicons + `og-image.png` |
| `public/uploads/studio/` | Admin-uploaded images (local dev) |

---

## Database models (MeTi-relevant)

| Model | Purpose |
|-------|---------|
| `StudioContent` | Singleton CMS: `id="default"`, `data` JSON (name, images, EN/EL copy) |
| `AdvisorSchedule` | Weekly hours per `dayOfWeek` (0=Sun) |
| `BlockedTime` | Date ranges excluded from booking |
| `AdvisorService` | Reformer Session — duration, price |
| `Appointment` | Bookings; capacity by exact `scheduledAt` |
| `AdvisorProfile` | Studio instructor |

Optional env: `STUDIO_ADVISOR_ID` — pin instructor for `/api/studio`.

---

## API reference

### Public (customer)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/studio` | Instructor ID + studio name |
| `GET` | `/api/studio/content` | CMS content for homepage |
| `GET` | `/api/advisors/[id]` | Schedule + reformer services only |
| `GET` | `/api/slots` | Slots with capacity + blocked times |
| `POST` | `/api/appointments` | Create booking (409 if full) |
| `POST` | `/api/auth/*` | better-auth |

### Admin (require `role === ADMIN`)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET/PUT` | `/api/admin/studio/schedule` | Weekly hours |
| `GET/POST/DELETE` | `/api/admin/studio/blocked-times` | Block dates |
| `GET/PUT` | `/api/admin/studio/content` | Website CMS |
| `POST` | `/api/admin/studio/upload` | Image upload (hero/reformer) |
| `GET` | `/api/admin/studio` | Calendar page data |

---

## Internationalization

| Piece | Detail |
|-------|--------|
| Locales | `en`, `el` |
| Cookie | `flow-locale` |
| Provider | `LocaleProvider` in root layout |
| Hooks | `useTranslations()`, `useStudioBranding()`, `useLocale()` |
| Greek fonts | `html[lang="el"]` → Noto Sans body, GFS Didot display |
| English fonts | DM Sans body, Cormorant Garamond display |
| Auto-detect | `navigator.language` starting with `el` → Greek |

**Customer pages translated:** homepage, `/book`, auth, checkout, client dashboard nav.  
**Admin/advisor dashboards:** English only.

CMS overrides merge over locale files for: `meta`, `hero`, `common.hours`.

---

## Slot capacity & schedule

1. `siteConfig.slotCapacity = 3`
2. Default schedule: **Tue/Thu/Sat 14:00–17:00**, gap 10 min → **3 slots/day**
3. `GET /api/slots` — counts appointments, applies blocked times
4. `POST /api/appointments` — transaction, 409 when full
5. Admin calendar enforces max **3 active days/week**

Tests: `tests/unit/slots.test.ts`, `tests/unit/studio-schedule.test.ts`

---

## Demo accounts

Password: **`Demo1234!`**

| Role | Email | Use |
|------|-------|-----|
| Client | `client@demo.meti-booking.local` | Book at `/book` |
| Instructor | `instructor@meti-pilates.studio` | `/advisor` |
| Admin | `admin@demo.meti-booking.local` | `/admin/schedule`, `/admin/content` |

### `pnpm demo:setup` seeds

- Users (admin, instructor, client)
- One service: **Reformer Session** (50 min, €45)
- Schedule: **Tue/Thu/Sat 14:00–17:00**
- **`studio_content`** row with default EN/EL copy and images
- Pilates category + instructor link

---

## Environment variables

Copy `.env.demo.example` → `.env`.

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL |
| `BETTER_AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | Public URL, no trailing slash |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | Same |
| `BLOB_READ_WRITE_TOKEN` | ⚠️ | Vercel Blob for admin image uploads in prod |
| `GOOGLE_CLIENT_ID/SECRET` | ⚠️ | Placeholder on demo |
| `APP_URL` | ⚠️ | MP webhooks |
| `STUDIO_ADVISOR_ID` | ❌ | Optional instructor pin |

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

pnpm exec tsx scripts/generate-brand-assets.ts   # favicons + og-image.png
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
| `/services`, `/advisor/*`, `/admin/advisors` | Original Meti marketplace |
| `/call/[id]` | LiveKit video |

---

## App directory map

```
src/app/
  (marketing)/          # Public MeTi site
    page.tsx            # Hero only
    book/page.tsx
  (auth)/               # Login/register
  (platform)/
    checkout/
    admin/
      schedule/         # Calendar admin
      content/          # Website CMS
  api/
    studio/content/     # Public CMS API
    admin/studio/       # Admin calendar + CMS APIs
src/components/
  landing/              # hero, navbar, footer
  booking/              # calendar, slots, summary
  providers/            # locale-provider (i18n + CMS)
src/lib/
  site-config.ts
  studio-content*.ts
  studio-schedule.ts
  slots.ts
prisma/schema.prisma    # StudioContent model
public/images/          # Default photos
public/uploads/studio/  # Admin uploads
```

---

## Known issues & roadmap

| Topic | Status |
|-------|--------|
| Google OAuth | Placeholder — email/password works |
| Payments | MP not configured |
| Stripe / Revolut | Issues #2–#7 |
| Permanent hosting | #10 — `render.yaml` |
| Guest checkout | #8 |
| Admin/advisor UI Greek | Not translated |
| Timezone | Colombia UTC-5 legacy — consider Europe/Athens |
| OG image | ✅ Done |
| Image loading on tunnel | ✅ `images.unoptimized: true` |
| Admin CMS | ✅ `/admin/content` |
| Admin calendar | ✅ `/admin/schedule` |

### GitHub issues

[#1](https://github.com/panagiod/meti-booking/issues/1)–[#10](https://github.com/panagiod/meti-booking/issues/10) — see repo issues for payments, OAuth, hosting.

---

## Project history

1. **Meti** — advisory marketplace (video, multi-category).
2. **Flow Pilates** — demo rebrand.
3. **MeTi Pilates** — reformer-only, Greek i18n, mobile, 3-slot capacity.
4. **Homepage** — single hero; "Book your session."
5. **Admin calendar** — 3 days/week, afternoon hours.
6. **Admin CMS** — editable text + images in DB.
7. **Greek fonts** — Noto Sans + GFS Didot.
8. **OG/favicons** — reformer hero branding.
9. **Payments** — Stripe/Revolut planned, not done.

---

## Cursor continuation checklist

1. Read **`docs/PROJECT.md`** + **`docs/ADMIN.md`**.
2. `git pull` on `main`.
3. `docker compose up -d` → `.env` → `pnpm install` → `pnpm demo:setup` → `pnpm dev`.
4. **Scope:** reformer-only public site unless asked otherwise.
5. **Copy:** admin CMS overrides DB; code defaults in `en.ts`/`el.ts`/`site-config.ts`.
6. **Schedule:** admin calendar or `studio-schedule.ts` + `demo-setup.ts`.
7. **Images:** admin upload or `public/images/`; run `generate-brand-assets.ts` after icon changes.
8. **Schema changes:** `pnpm db:migrate` + update `demo-setup.ts`.
9. **Payments:** MP legacy — Stripe planned (#4).

### Recent commits (Aug 2026)

| Commit | Change |
|--------|--------|
| `ec69328` | Admin website content editor |
| `ff2c292` | Greek fonts + translations |
| `b911129` | OG thumbnail + favicons |
| `8c205a6` | 3-day calendar + admin schedule |
| `42cc13e` | PROJECT.md handoff doc |
| `6307115` | MeTi Pilates rebrand |

---

## Related docs

| Doc | Contents |
|-----|----------|
| [README.md](../README.md) | Quick start |
| [ADMIN.md](./ADMIN.md) | **Admin calendar + CMS guide** |
| [DEMO.md](./DEMO.md) | Local demo walkthrough |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deploy |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | OAuth, payments, images |
| [DEPLOYMENT_STATUS.md](../DEPLOYMENT_STATUS.md) | Live demo URL |
| [AGENTS.md](../AGENTS.md) | Cursor agent notes |
