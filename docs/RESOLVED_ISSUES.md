# Resolved issues (close on GitHub)

> Code fixes landed on `main` (commits `73aaf61`–`8c33ca4`).  
> The GitHub token in this environment cannot close issues — **close these manually** or run locally:
>
> ```bash
> for n in 9 11 12 13 14 15 16 17 18 20 21 22 23 24 25 26 27 28 29 30; do
>   gh issue close $n --comment "Fixed on main (Aug 2026 audit batch)."
> done
> ```

| Issue | Title | Fix |
|-------|-------|-----|
| #9 | EUR currency | `siteConfig.currency`, centralized `formatCurrency` |
| #11 | Timezone | `Europe/Athens` via `STUDIO_TIMEZONE` |
| #12 | Server appointment validation | `validateBookableSlot()` in `slot-booking.ts` |
| #13 | Bootstrap endpoint security | Session required on setup routes |
| #14 | Payment verification | `payment-verify.ts`, amount/reference checks |
| #15 | Booking race | Serializable transaction on create |
| #16 | Schedule ownership | Studio instructor cannot edit via advisor API |
| #17 | False availability | Calendar waits for slots API |
| #18 | GET /api/slots writes | Read-only GET |
| #20 | Cron auth | Fail-closed without `CRON_SECRET` in prod |
| #21 | Blob uploads on redeploy | Prod requires `BLOB_READ_WRITE_TOKEN` |
| #22 | Booking horizon | 8 weeks (`bookingWeeksAhead`) |
| #23 | discountCents bypass | Server ignores client discount |
| #24 | Hardcoded 15% fee | `checkout/quote` + booking summary (`8c33ca4`) |
| #25 | Admin middleware | Server `requireAdminSession` + proxy |
| #26 | Corrupt CMS JSON | Strict parse returns 500 |
| #27 | Demo password | `DEMO_PASSWORD` + `ALLOW_DEMO_SEED` |
| #28 | MP token encryption | `ENCRYPTION_KEY` + `advisor-mp.ts` |
| #29 | Admin lunch/gap | `/admin/schedule` fields |
| #30 | demo reset CMS | `--reset-content` flag |

| #31 | `bookingLeadHours` default | `resolveBookingLeadHours()` + schema default 2h |

## Still open (recommended next)

| Issue | Title |
|-------|-------|
| #10 | Permanent deploy (Vercel + domain) |
| #8 | Guest checkout |
| #2–#7 | Stripe / Revolut payments epic |
| #19 | Single-day block UX (works via same From/To date — may close) |
