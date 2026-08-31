#!/usr/bin/env bash
# Close GitHub issues fixed on main (Aug 2026 audit batch).
# Requires: gh auth login with issue write access on panagiod/meti-booking
set -euo pipefail

close() {
  local num="$1"
  local body="$2"
  echo "Closing #$num..."
  gh issue close "$num" --comment "$body"
}

close 1 "Fixed: \`images.unoptimized: true\` in \`next.config.ts\` for standalone/tunnel deploys. Bundled + admin-uploaded images work without the Next.js image optimizer."

close 9 "Fixed in \`2025a7b\`: EUR currency site-wide via \`siteConfig.currency\` and centralized \`formatCurrency()\`."

close 11 "Fixed in \`73aaf61\`: \`Europe/Athens\` timezone via \`STUDIO_TIMEZONE\` and \`src/lib/timezone.ts\`."

close 12 "Fixed in \`73aaf61\`: \`validateBookableSlot()\` in \`src/lib/slot-booking.ts\` validates schedule, blocks, lead time, and capacity."

close 13 "Fixed in \`84cd32c\`: bootstrap/setup routes require authenticated session (\`requireSelfOrBootstrap\`)."

close 14 "Fixed in \`84cd32c\`: payment verify/webhook checks amount, reference, and status (\`payment-verify.ts\`, \`payment-assert.ts\`)."

close 15 "Fixed in \`73aaf61\`: serializable transaction on \`POST /api/appointments\` prevents double-booking."

close 16 "Fixed in \`73aaf61\`: studio instructor schedule blocked from advisor PUT (\`studio-instructor.ts\`)."

close 17 "Fixed in \`73aaf61\`: booking calendar waits for slots API before marking days available."

close 18 "Fixed in \`73aaf61\`: \`GET /api/slots\` is read-only (no writes)."

close 19 "Works: admin calendar block form accepts the same From/To date for a single-day closure. Documented in \`docs/ADMIN.md\`."

close 20 "Fixed in \`73aaf61\`: cron endpoints fail-closed in production without \`CRON_SECRET\` (\`cron-auth.ts\`)."

close 21 "Fixed in \`2025a7b\`: production image uploads require \`BLOB_READ_WRITE_TOKEN\` or return 503."

close 22 "Fixed in \`73aaf61\`: 8-week booking horizon (\`siteConfig.bookingWeeksAhead\`)."

close 23 "Fixed in \`73aaf61\`/\`84cd32c\`: server ignores client \`discountCents\`; promotions validated server-side."

close 24 "Fixed in \`8c33ca4\`: booking summary and checkout use \`GET /api/checkout/quote\` for category-based fees."

close 25 "Fixed in \`2025a7b\`/\`40ec61f\`: server admin layout + proxy middleware; \`requireAdminSession()\` on admin APIs."

close 26 "Fixed in \`2025a7b\`: corrupt CMS JSON returns 500 in strict mode instead of silent overwrite."

close 27 "Fixed in \`2025a7b\`: \`DEMO_PASSWORD\` env + \`ALLOW_DEMO_SEED=1\` guard for production demo seed."

close 28 "Fixed in \`2025a7b\`: AES-256-GCM encryption for MP tokens (\`ENCRYPTION_KEY\`, \`advisor-mp.ts\`)."

close 29 "Fixed in \`2025a7b\`: admin schedule UI includes lunch break and gap minutes fields."

close 30 "Fixed in \`2025a7b\`: \`pnpm demo:setup -- --reset-content\` resets website CMS to defaults."

close 31 "Fixed in \`8ebf9d6\`: \`resolveBookingLeadHours()\` standardizes 2h default across book, slots, validation, profile, and schema."

echo "Done. Remaining open: #2–#8 (payments), #10 (deploy)."
