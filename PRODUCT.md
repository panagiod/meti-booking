# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Advisors (Professionals):**
- Independent professionals across various fields (legal, financial, health, technology, education, etc.)
- Want to monetize their expertise by offering advisory sessions via video call
- Need full control over their schedule, prices, and availability
- Look for a platform that simplifies management without technical complexity

**Clients:**
- Individuals and small businesses seeking specialized professional advice
- Prefer the convenience of being served from anywhere (100% online)
- Value price transparency and easy scheduling
- Want a secure, professional experience

**Administrators:**
- Meti team responsible for managing the platform
- Superadmin level: Full system control
- Manager level: Platform issue resolution
- Configure fees, oversee operations, manage billing

## Product Purpose

Meti connects professionals who want to offer advisory sessions with clients seeking specialized guidance. The platform removes geography and logistics barriers, allowing advisory sessions to happen via video call with the same quality as an in-person meeting.

**Success is defined as:**
- Advisors who activate their services and regularly receive clients
- Clients who find the right advisor and complete satisfactory sessions
- Smooth, transparent payment transactions
- Retention of advisors satisfied with the platform

## Positioning

Meti differentiates itself through:
- **Fair pricing model:** The advisor sets how much they want to earn; the platform adds a transparent fee, with no hidden commissions
- **Powerful schedule management:** Recurring configuration by day of week, lunch breaks, gaps between appointments, no daily appointment limit
- **100% online with chat:** Integrated video call + persistent text chat during the session
- **Flexible promotions:** Advisors can create discounts for special dates (percentage or fixed amount)
- **Clear cancellation policy:** Always free to reschedule (with configurable minimum notice), cancel without refund
- **Dark mode:** Light/dark theme with toggle across the platform

## Operating Context

- **Client flow:** Search → Browse profiles → Select service → Choose date/time → Pay with Mercado Pago → Join video call → Rate
- **Advisor flow:** Register → Configure profile and MP credentials → Create services → Set schedule → (Optional) Create promotions → Attend sessions → Receive monthly billing
- **Admin flow:** Manage advisors → Configure fees and minimum prices → Oversee transactions → Generate fee invoices
- **Payments:** Mercado Pago Checkout PRO, each advisor uses their own credentials (non-custodial model)
- **Video calls:** LiveKit Cloud with recording (Egress to S3) and persistent chat
- **Notifications:** Confirmation and reminder emails (Resend) + in-app toasts (Sileo)

## Capabilities and Constraints

**Confirmed capabilities:**
- Authentication with Google OAuth **and email/password** (better-auth, with account linking)
- User roles with area-based access control (CLIENT → dashboard, ADVISOR → advisor, ADMIN → admin)
- First system user automatically becomes ADMIN
- Multiple services per advisor with variable duration and price
- Recurring schedule by day of week (advisor-configured) + time blocks
- Automatic generation of available slots that block already-booked times
- Booking with automatic confirmation on payment
- Checkout with Mercado Pago (each advisor registers their credentials)
- LiveKit video call with persistent text chat and recording (Egress to S3)
- Review system (1–5 rating + comment)
- Special-date promotions (percentage or fixed discount)
- Admin panel with fee and minimum price configuration, advisor verification, and monthly billing
- Monthly itemized fee billing for advisors (admin marks as paid)
- Email notifications (payment confirmation, new booking, 24h reminder)
- In-app toasts with Sileo (action feedback and new booking alerts)
- Dark mode (toggle in navbar and dashboards)
- Public pages: FAQ, advisor resources, success stories, terms, privacy, cookies, refunds

**Constraints:**
- Free advisory sessions are not allowed (minimum price configurable by admin)
- Fee is a markup (added to advisor price, not deducted)
- Cancellation: free reschedule with minimum notice (configurable per service), cancel/no-show without refund
- Modality: 100% online (video call required)
- Payment: Mercado Pago only (no other methods in MVP)
- Promotion discount is absorbed by the advisor (platform keeps its fee on the original price)

**Open decisions:**
- Post-MVP support: live chat (outside the call), SMS, push notifications

## Brand Commitments

- **Name:** Meti (inspired by the Greek goddess Metis, goddess of wisdom and prudence)
- **Domain:** metipilates.com
- **Visual tone:** Energetic / Bold (vibrant orange + dark blue)
- **Voice:** Professional but approachable, direct, trustworthy

## Test Accounts

Test accounts for QA and automation (TestSprite). All use the same password.

| Role | Email | Password |
|---|---|---|
| **Admin** | edwaramayadiaz@gmail.com | Control2486 |
| **Advisor** | amayadiazedwarorlando@gmail.com | Control2486 |
| **Client** | edwarorlandoamayadiaztest@gmail.com | Control2486 |

- **Main URL:** https://metipilates.com
- **Test advisor data:** 2 active services (Strategic consulting $100,000 / Financial planning $80,000), schedule Mon–Fri 09:00–17:00 (lunch 12:00–13:00), verified profile
- **Note:** the advisor does not yet have Mercado Pago credentials connected; checkout will show "Payment unavailable" until configured

## Test Matrix (TestSprite)

**Public flows (no login):**
1. Landing: hero, categories, how it works, CTA
2. Browse advisors (search)
3. Advisor profile: info, services, video (if applicable), calendar
4. Legal pages: FAQ, resources, stories, terms, privacy, cookies, refunds
5. Booking: select service → date → time (unavailable slots should be hidden)

**Authenticated flows (client):**
6. Login with email/password
7. Dashboard: appointments (filters), profile
8. Full booking through checkout (requires advisor MP to pay)
9. Log out

**Authenticated flows (advisor):**
10. Dashboard with new booking alert (toast)
11. Service CRUD (create, edit, activate/deactivate, delete) — feedback with toasts
12. Schedule: month/week/day/agenda views with appointments
13. Promotions: create, activate/deactivate, delete
14. Payments: view monthly invoices
15. Mercado Pago configuration

**Authenticated flows (admin):**
16. Dashboard with statistics
17. Advisor document verification
18. Billing: generate monthly invoices, mark as paid
19. Users and fee configuration

**Access controls:**
20. Client must NOT access /advisor or /admin
21. Advisor must NOT access /admin
22. Admin must NOT access /advisor

## Product Principles

1. **Full transparency:** The advisor always knows how much they earn and how much the platform charges; the client sees the final price with no surprises
2. **Flexibility for advisors:** Complete control over services, schedules, prices, and promotions
3. **Smooth client experience:** From search to booking and attending, the process must be fast and intuitive
4. **Scalability without complexity:** Non-custodial payment model that allows growth without payment infrastructure
5. **Clear rules:** Cancellation and reschedule policies are clear from first contact

## Accessibility & Inclusion

- Responsive interface (desktop and mobile)
- WCAG AA color contrast (in light and dark mode)
- Keyboard navigation
- Alt text on images
- Accessible forms with labels and clear validation
