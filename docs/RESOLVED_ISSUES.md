# Resolved issues (Aug 2026 audit)

Issues **#1, #8, #9, #11–#31** are fixed on `main`. Close them on GitHub with:

```bash
./scripts/close-resolved-issues.sh
```

Requires `gh auth login` with **issue write** access on `panagiod/meti-booking` (the Cursor cloud token cannot close issues).

**Still open:** #2–#8 (payments/OAuth epic), #10 (permanent deploy).

---

## Closed by code (reference)

| Issue | Summary | Key commit / file |
|-------|---------|-------------------|
| #1 | Image loading on tunnel/standalone | `next.config.ts` `images.unoptimized` |
| #9 | EUR currency | `2025a7b` · `siteConfig.currency` |
| #11 | Europe/Athens timezone | `73aaf61` · `timezone.ts` |
| #12 | Server slot validation | `73aaf61` · `slot-booking.ts` |
| #13 | Bootstrap auth | `84cd32c` · `session-auth.ts` |
| #14 | Payment verification | `84cd32c` · `payment-verify.ts` |
| #15 | Booking race / capacity | `73aaf61` · serializable txn |
| #16 | Schedule ownership | `73aaf61` · `studio-instructor.ts` |
| #17 | False calendar availability | `73aaf61` · slots API loading state |
| #18 | GET /api/slots writes | `73aaf61` · read-only GET |
| #19 | Single-day block | Same From/To date in admin calendar |
| #20 | Cron auth | `73aaf61` · `cron-auth.ts` |
| #21 | Blob uploads on redeploy | `2025a7b` · prod requires token |
| #22 | 8-week booking horizon | `73aaf61` · `bookingWeeksAhead` |
| #23 | discountCents bypass | `73aaf61` / `84cd32c` |
| #24 | Hardcoded 15% fee | `8c33ca4` · `checkout/quote` + booking summary |
| #25 | Admin middleware | `2025a7b` · `admin/layout.tsx`, `proxy.ts` |
| #26 | Corrupt CMS JSON | `2025a7b` · strict parse → 500 |
| #27 | Demo password | `2025a7b` · `DEMO_PASSWORD` |
| #28 | MP token encryption | `2025a7b` · `encryption.ts` |
| #29 | Admin lunch/gap | `2025a7b` · `/admin/schedule` |
| #30 | demo reset CMS | `2025a7b` · `--reset-content` |
| #31 | bookingLeadHours default | `8ebf9d6` · `booking-config.ts` |

---

## Recommended next issues

| Issue | Title |
|-------|-------|
| #10 | Deploy to Vercel + permanent domain |
| #8 | Guest checkout |
| #3 | Google OAuth for production |
| #2–#7 | Stripe / Revolut payments epic |
