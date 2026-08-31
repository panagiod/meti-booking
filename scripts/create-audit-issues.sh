#!/usr/bin/env bash
# Creates GitHub issues from operational/logical audit (2026-08-31)
set -euo pipefail

create() {
  local title="$1"
  local body="$2"
  local labels="$3"
  gh issue create --title "$title" --label "$labels" --body "$body"
}

create "Fix studio timezone: hardcoded Colombia (UTC-5) breaks Greek/EUR scheduling" "$(cat <<'EOF'
## Problem
All schedule times, slot generation, and appointment parsing assume **Colombia (UTC-5)** via `APP_TIMEZONE_OFFSET_HOURS = -5` in `src/lib/timezone.ts`. MeTi Pilates is a Greek/European studio (EUR, `el-GR`, afternoon hours like 14:00–17:00).

This causes wrong day-of-week matching, incorrect slot times, and mismatches between admin calendar, `/book`, and stored appointments when the server runs in UTC (Vercel) or users are in Europe.

## Evidence
- `src/lib/timezone.ts` — Colombia offset hardcoded
- `src/lib/slots.ts` — lead-time uses `setHours()` (runtime TZ)
- `src/app/api/appointments/route.ts` — `parseLocalISO()`
- `src/app/api/slots/route.ts` — `new Date(date).getDay()` on date strings

## Expected
Studio operates in `Europe/Athens` (configurable via env).

## Suggested fix
- Replace fixed offset with `date-fns-tz` / `Temporal` and `STUDIO_TIMEZONE` env var
- Build all slot instants and day-of-week lookups in studio local time
- Add unit tests for DST boundaries and cross-midnight blocks

## Priority
**Critical** — affects every booking.

## Related
- #9 (EUR display)
EOF
)" "bug"

create "Validate appointments server-side against schedule, blocks, and slot rules" "$(cat <<'EOF'
## Problem
`POST /api/appointments` only checks capacity (`count` at exact `scheduledAt`). It does **not** verify:
- Day is active in `advisor_schedule`
- Time falls within start/end (and outside lunch)
- Lead time (`bookingLeadHours`) is met
- Date is not blocked (`blocked_time`)
- Slot matches `generateAvailableSlots()` output

Clients can bypass the booking UI and POST arbitrary datetimes.

## Evidence
- `src/app/api/appointments/route.ts` — transaction only does capacity count
- Slot engine exists in `src/lib/slots.ts` but is unused on create

## Suggested fix
Reuse the same slot engine as `GET /api/slots` inside appointment creation. Reject with 400 if the requested slot is not in the available set.

## Priority
**Critical** — security + data integrity.

## Acceptance criteria
- [ ] Cannot book on inactive weekdays
- [ ] Cannot book outside schedule hours
- [ ] Cannot book blocked dates
- [ ] Cannot book inside lead-time window
- [ ] Integration test covers bypass attempt
EOF
)" "bug"

create "Secure admin and advisor bootstrap endpoints (unauthenticated privilege escalation)" "$(cat <<'EOF'
## Problem
These endpoints promote arbitrary `userId` values without session checks:
- `POST /api/admin/setup` — first caller becomes SUPERADMIN when `adminCount === 0`
- `POST /api/advisor/setup` — any user can become ADVISOR
- `POST /api/client/setup` — unauthenticated profile setup

On a fresh deploy before `demo:setup`, the first requester can claim admin. Redirect/onboarding flows call admin setup from the client.

## Evidence
- `src/app/api/admin/setup/route.ts`
- `src/app/api/advisor/setup/route.ts`
- `src/app/(auth)/redirect/page.tsx`
- `src/app/(platform)/onboarding/page.tsx`

## Suggested fix
- Require authenticated session where `userId === session.user.id`
- Use one-time `ADMIN_BOOTSTRAP_TOKEN` env for first admin, or CLI-only bootstrap
- DB transaction + lock for first-admin race
- Disable public bootstrap in production unless explicit flag

## Priority
**Critical** — security.

## Acceptance criteria
- [ ] Unauthenticated POST to setup routes returns 401
- [ ] Cannot promote a different user's account
- [ ] E2E test for bootstrap flow updated
EOF
)" "bug"

create "Secure payment verification: auth, amount, and reference checks" "$(cat <<'EOF'
## Problem
Payment confirmation has multiple gaps:
1. `POST /api/appointments/[id]/verify` has **no auth** — anyone with IDs can confirm
2. Webhook and verify only check `payment.status === "approved"`
3. Neither validates `transaction_amount` vs `appointment.totalCents` or `external_reference`

## Evidence
- `src/app/api/appointments/[appointmentId]/verify/route.ts`
- `src/app/api/webhooks/mercadopago/route.ts`

## Suggested fix
- Require booking client session (or signed internal token) on verify
- After `getPayment()`, assert amount, currency, and `external_reference === appointmentId`
- Validate MP webhook signature when secret configured
- Reject if `paymentId` already linked to another appointment

## Priority
**Critical** — security / payments.

## Related
- #2 (Stripe/Revolut epic) — apply same validation pattern to new providers
EOF
)" "bug"

create "Fix concurrent booking race: slot capacity can be exceeded" "$(cat <<'EOF'
## Problem
Capacity uses check-then-act (`count` then `create`) without row locks or unique constraints. Two simultaneous POSTs for the same slot can both pass and overbook beyond `siteConfig.slotCapacity` (3).

## Evidence
- `src/app/api/appointments/route.ts` — `$transaction` with count only
- `prisma/schema.prisma` — no unique index on `(advisorId, scheduledAt)` for active statuses

## Suggested fix
- Serializable isolation or `SELECT FOR UPDATE`
- Partial unique index for active appointment statuses at same `scheduledAt`
- Optional short-lived slot reservation record

## Priority
**High**

## Acceptance criteria
- [ ] Concurrent booking test cannot exceed capacity
- [ ] Clear 409 response when slot is full
EOF
)" "bug"

create "Unify schedule ownership: admin and advisor both overwrite same calendar" "$(cat <<'EOF'
## Problem
Admin (`/api/admin/studio/schedule`) and instructor (`/api/advisor/schedule`) both `deleteMany` + recreate `advisor_schedule` for the same studio instructor. Either side silently overwrites the other.

Admin save syncs CMS hours line; advisor save does not. This explains `/book` showing Mon–Sat 06:00–20:00 when admin intended Mon/Wed/Sat 14:00–17:00.

## Evidence
- `src/app/api/admin/studio/schedule/route.ts`
- `src/app/api/advisor/schedule/route.ts`
- Live API currently returns 6 active days with long hours

## Suggested fix (pick one)
1. **Studio mode:** Admin owns schedule; advisor schedule UI is read-only for studio instructor
2. **Single editor:** Remove duplicate UI; one canonical admin page
3. **Coordination:** Version field + conflict warning; always sync CMS hours on any save

## Priority
**High** — operational confusion.

## Acceptance criteria
- [ ] Only one role can mutate studio weekly hours
- [ ] `/book` reflects last admin save after refresh
- [ ] Documented in `docs/ADMIN.md`
EOF
)" "enhancement"

create "Booking calendar shows false availability before slots API loads" "$(cat <<'EOF'
## Problem
`/book` builds the calendar with `getAvailableDates()` using **empty** blocked times and no existing appointments. Days appear clickable until `/api/slots` returns and merges real data. Users may click dates that are full or blocked.

## Evidence
- `src/app/(marketing)/book/page.tsx` — `getAvailableDates(..., [], leadHours)` then async merge
- `src/components/booking/calendar-picker.tsx` — `hasAvailability` defaults false only after merge

## Suggested fix
- Show loading state until slot data fetched
- Or batch endpoint: `GET /api/slots?from=&to=` returning all days in one call
- Treat days as unavailable until server confirms

## Priority
**High** — UX + trust.

## Related
- Issue for N parallel slot requests (separate)
EOF
)" "bug"

create "Batch slots API and remove writes from GET /api/slots" "$(cat <<'EOF'
## Problem
1. Book page fires **~14 parallel** `GET /api/slots` requests (one per day in 2-week window)
2. Each request runs `updateMany` to cancel stale PENDING appointments — a **write on a read endpoint**
3. Amplifies load and can race with slow checkout

## Evidence
- `src/app/(marketing)/book/page.tsx` — `Promise.all(availableDates.map(...))`
- `src/app/api/slots/route.ts` — PENDING expiry before returning slots

## Suggested fix
- Add `GET /api/slots?advisorId=&serviceId=&from=&to=` batch response
- Move PENDING expiry exclusively to cron (`/api/cron/expire-pending`)
- Keep GET read-only

## Priority
**Medium** — performance + ops.

## Acceptance criteria
- [ ] Book page makes ≤2 requests for calendar load
- [ ] GET /api/slots has no side effects
EOF
)" "enhancement"

create "Admin cannot block a single calendar day (holiday closure)" "$(cat <<'EOF'
## Problem
Admin block UI uses date inputs. When start and end are the same day, both parse to the same UTC instant and API rejects `endDate <= startDate`. Single-day closures (holidays) fail.

## Evidence
- `src/app/(platform)/admin/schedule/page.tsx` — `new Date(blockStart).toISOString()`
- `src/app/api/admin/studio/blocked-times/route.ts` — rejects equal dates

## Suggested fix
- Treat same-day all-day blocks as inclusive (end = end of day in studio TZ)
- Parse dates with `localToUTCDate` / studio timezone, not bare `new Date('YYYY-MM-DD')`

## Priority
**Medium**

## Acceptance criteria
- [ ] Admin can block exactly one day
- [ ] Blocked day does not appear on `/book`
EOF
)" "bug"

create "Cron endpoints are public when CRON_SECRET is unset" "$(cat <<'EOF'
## Problem
Cron routes only reject when `CRON_SECRET` **is set** and header mismatches. If unset (local demo, misconfigured prod), anyone can trigger expire/cleanup/reminder jobs.

## Evidence
- `src/app/api/cron/expire-pending/route.ts`
- `src/app/api/cron/reminders/route.ts`
- `src/app/api/cron/cleanup-cancelled/route.ts`

## Suggested fix
Fail closed in production: return 503 if `CRON_SECRET` missing. Always require `Authorization: Bearer …`.

## Priority
**High** — security / ops.

## Acceptance criteria
- [ ] Unauthenticated cron call returns 401/503 in production
- [ ] Document `CRON_SECRET` as required in deploy docs
EOF
)" "bug"

create "CMS image uploads lost on redeploy without Vercel Blob" "$(cat <<'EOF'
## Problem
Without `BLOB_READ_WRITE_TOKEN`, studio images save to `public/uploads/studio/` inside the container. Path is gitignored, not in Docker image, wiped on redeploy. Admin sees "saved" URLs that 404 after next deploy.

## Evidence
- `src/app/api/admin/studio/upload/route.ts`
- `.gitignore` — `/public/uploads`
- `deploy/Dockerfile` — no uploads volume

## Suggested fix
- Require Blob/R2 in production (fail upload with clear error if unset)
- Docker: mount persistent volume for uploads
- Startup warning when production lacks blob config

## Priority
**High** — content persistence.

## Related
- #1 (image loading on tunnel deploys)
EOF
)" "bug"

create "Extend booking calendar horizon and clarify disabled future dates" "$(cat <<'EOF'
## Problem
`getAvailableDates` hardcodes `weeksToShow: 2`. Calendar allows navigating to future months where **all dates appear disabled** with no explanation (user screenshot: Sept 15+ greyed out).

## Evidence
- `src/app/(marketing)/book/page.tsx` — `getAvailableDates(..., 2, ...)`
- `src/components/booking/calendar-picker.tsx` — unbounded month navigation

## Suggested fix
- Configurable horizon (e.g. 8–12 weeks) via `siteConfig`
- Clamp month navigation to loaded range OR lazy-load more weeks on forward nav
- Show helper text: "Bookings open through [date]"

## Priority
**Medium** — UX.

## Acceptance criteria
- [ ] Users can book at least 4 weeks ahead (configurable)
- [ ] No confusing all-grey months without explanation
EOF
)" "enhancement"

create "Reject client-supplied discountCents; validate promotions server-side" "$(cat <<'EOF'
## Problem
`POST /api/appointments` accepts `discountCents` from the client and applies it in `calculatePrices()`. `promotionId` is parsed but **never validated**. Attackers can send `discountCents: service.priceCents` for near-free bookings.

## Evidence
- `src/app/api/appointments/route.ts`
- `src/app/(platform)/checkout/page.tsx`

## Suggested fix
- Ignore client `discountCents`
- If `promotionId` provided, load promotion server-side (active, date range, service/advisor match) and compute discount

## Priority
**High** — security / business logic.
EOF
)" "bug"

create "Checkout displays hardcoded 15% fee; server uses per-category fees" "$(cat <<'EOF'
## Problem
Checkout UI computes `serviceFee = Math.round(servicePrice * 0.15)` client-side. Server recalculates with category `feePercentage` and `maxFeeCents` from admin config. Users see a different total than what is charged.

## Evidence
- `src/app/(platform)/checkout/page.tsx`
- `src/app/api/appointments/route.ts` + `src/lib/pricing.ts`
- `src/app/(platform)/admin/config/page.tsx`

## Suggested fix
- Add `GET /api/checkout/quote?serviceId=&promotionId=` for server-computed totals
- Checkout displays only server-returned pricing

## Priority
**Medium**

## Related
- #9 (EUR pricing)
EOF
)" "bug"

create "Add middleware for /admin routes (client-only guard today)" "$(cat <<'EOF'
## Problem
`/admin/*` authorization runs in client `useEffect` in `admin/layout.tsx`. No `middleware.ts`. Admin pages flash before redirect; future server components could leak data. Admin API routes use inconsistent auth patterns (`requireAdminSession` vs inline checks).

## Evidence
- `src/app/(platform)/admin/layout.tsx`
- `src/lib/admin-auth.ts` — only used in studio admin APIs
- No `middleware.ts` in repo

## Suggested fix
- Next.js middleware: redirect non-admins before render
- Standardize all `/api/admin/*` on `requireAdminSession()`

## Priority
**Medium** — security maintainability.
EOF
)" "enhancement"

create "Corrupt CMS JSON silently reverts to defaults (overwrite risk)" "$(cat <<'EOF'
## Problem
`getStudioContent()` catches Zod parse errors and returns `buildDefaultStudioContent()` without logging. Admin UI loads defaults; an accidental save would overwrite production content.

## Evidence
- `src/lib/studio-content-server.ts`

## Suggested fix
- Return 500 with clear admin error on parse failure; preserve raw JSON
- Log validation failures
- Optional version/backup before PUT

## Priority
**Medium**
EOF
)" "bug"

create "demo:setup ships hardcoded password; unsafe on staging/production" "$(cat <<'EOF'
## Problem
`scripts/demo-setup.ts` uses fixed password `Demo1234!` for all demo accounts and prints it to stdout. Documented for Render/VPS deploys — leaves known admin credentials on public URLs.

## Evidence
- `scripts/demo-setup.ts`
- `docs/DEPLOYMENT.md`, `render.yaml`

## Suggested fix
- Generate random password per run or require `DEMO_PASSWORD` env
- Block `demo:setup` when `NODE_ENV=production` unless `ALLOW_DEMO_SEED=1`
- Never log passwords in CI/deploy logs

## Priority
**High** — security / ops.
EOF
)" "bug"

create "Encrypt Mercado Pago tokens at rest (schema claims encrypted, stores plaintext)" "$(cat <<'EOF'
## Problem
`AdvisorProfile.mpAccessToken` schema comment says "Encrypted" but values are stored plaintext. DB leak exposes live payment credentials. Advisor UI claims encryption.

## Evidence
- `prisma/schema.prisma`
- `src/app/api/advisor/mercadopago/route.ts`
- `src/app/(platform)/advisor/mercadopago/page.tsx`

## Suggested fix
- Encrypt at rest with `ENCRYPTION_KEY` (AES-GCM) or use MP OAuth
- Align UI/docs with behavior

## Priority
**Medium**

## Related
- #6 (remove MP long-term)
EOF
)" "bug"

create "Align admin schedule UI with advisor controls (lunch, gap) or lock studio fields" "$(cat <<'EOF'
## Problem
Slot spacing (`gapMinutes`) and lunch breaks affect `generateAvailableSlots`, but admin schedule only exposes start/end. Instructors can set lunch/gap in advisor UI; admin cannot see or edit them. Admin slot preview may not match production.

## Evidence
- `src/app/(platform)/admin/schedule/page.tsx`
- `src/app/(platform)/advisor/schedule/components/weekly-schedule-form.tsx`

## Suggested fix
- Expose lunch/gap on admin schedule for studio instructor, OR
- Lock gap/lunch to studio config and hide from advisor for studio account

## Priority
**Medium** — logic / UX consistency.
EOF
)" "enhancement"

create "demo:setup --reset should optionally reset studio CMS content" "$(cat <<'EOF'
## Problem
`--reset` re-seeds advisor schedule/services but `ensureStudioContentSeed()` only inserts when row is absent. Resetting demo environment leaves stale CMS text/images, inconsistent with reset messaging.

## Evidence
- `scripts/demo-setup.ts`
- `src/lib/studio-content-server.ts`

## Suggested fix
- On `--reset`, upsert default studio content (with confirmation) or add `--reset-content` flag

## Priority
**Low**
EOF
)" "enhancement"

create "Standardize bookingLeadHours default across book, advisor, and profile flows" "$(cat <<'EOF'
## Problem
Lead-time fallbacks differ by entry path:
- `/book` — `bookingLeadHours || 2`
- Advisor marketing page — `|| 24`
- Advisor profile default — `24`

Users see different earliest bookable times depending on how they arrived.

## Evidence
- `src/app/(marketing)/book/page.tsx`
- `src/app/(marketing)/advisor/[id]/page.tsx`
- `src/app/(platform)/advisor/profile/page.tsx`

## Suggested fix
Single default in `siteConfig`; always use DB value without conflicting fallbacks.

## Priority
**Medium**
EOF
)" "bug"

echo "Done creating audit issues."
