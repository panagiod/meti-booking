# Integrations — MeTi Pilates

## Images

### Default (bundled)

- `/public/images/hero.jpg`
- `/public/images/reformer.jpg`

Code defaults in `src/lib/site-config.ts`. **Live site** uses URLs from admin CMS (`studio_content` table).

### Admin uploads

Admins replace images at **`/admin/content`** → Images & contact tab.

| Environment | Storage |
|-------------|---------|
| Local dev | `public/uploads/studio/` |
| **Hetzner VPS** | `SELF_HOSTED=1` → persistent volume at `/app/public/uploads/studio/` |
| Vercel production | **Vercel Blob** — `BLOB_READ_WRITE_TOKEN` required (503 without it) |

API: `POST /api/admin/studio/upload` (fields: `file`, `imageKey` = `hero` \| `reformer`).

See [docs/HOSTING.md](./HOSTING.md) for VPS setup.

### OG image & favicons

- Dynamic: `src/app/opengraph-image.tsx` (hero photo + MeTi copy)
- Static fallback: `public/og-image.png`
- Regenerate icons: `pnpm exec tsx scripts/generate-brand-assets.ts`

`next.config.ts` sets `images.unoptimized: true` for standalone/Cloudflare tunnel deploys.

Do not use external Unsplash URLs — many return 404.

---

## Google login

Code is **fully implemented** (better-auth). The Google button appears only when real credentials are set (not demo placeholders).

### Enable Google OAuth

See **[deploy/GOOGLE_OAUTH.md](../deploy/GOOGLE_OAUTH.md)** for the full checklist.

Quick steps:

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. OAuth 2.0 Client ID (Web)
3. **Authorized JavaScript origins:** your public URL + `http://localhost:3000`
4. **Authorized redirect URIs:** `{URL}/api/auth/callback/google`
5. Set env vars:

   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   BETTER_AUTH_URL=https://your-domain.com
   NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com
   APP_URL=https://your-domain.com
   ```

6. Redeploy

Validate production env before deploy:

```bash
BETTER_AUTH_URL=https://your-app.vercel.app \
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app \
DATABASE_URL=... BETTER_AUTH_SECRET=... CRON_SECRET=... \
pnpm deploy:check
```

> Tunnel URLs (`*.trycloudflare.com`) change when the VM restarts — update OAuth + env each time.

### Demo without Google

| Email | Password |
|-------|----------|
| `client@demo.meti-booking.local` | `Demo1234!` |

---

## Email (Resend)

Transactional email (booking confirmations, studio alerts, 24h reminders) uses **Resend**.

See **[deploy/RESEND.md](../deploy/RESEND.md)** for domain verification, API key, env vars, and testing.

Quick env vars:

```bash
RESEND_API_KEY=re_...
EMAIL_FROM="MeTi Pilates <bookings@metipilates.com>"
STUDIO_NOTIFICATION_EMAIL=tyrri_meropi@hotmail.com
```

Without `RESEND_API_KEY`, bookings work but no emails are sent.

---

## Payments

### Current (Mercado Pago)

Checkout uses **Mercado Pago Checkout Pro** per instructor (non-custodial). Currency: **EUR**. Not configured on demo.

1. Instructor logs in: `instructor@meti-pilates.studio` / `Demo1234!`
2. **Advisor → Mercado Pago** — add Public Key + Access Token (encrypted at rest via `ENCRYPTION_KEY`)
3. Set `APP_URL` to public domain
4. Set `ENCRYPTION_KEY` in production (`openssl rand -base64 32`)
5. Webhook: `https://your-domain.com/api/webhooks/mercadopago`

Pricing is computed server-side via `GET /api/checkout/quote` — client cannot override discounts.

Without MP: checkout shows **Payment unavailable**.

### Planned (GitHub issues)

User requested **Stripe or Revolut** with Apple Pay / Google Pay:

- #2 Epic: Replace Mercado Pago
- #4 Stripe + Apple/Google Pay
- #5 Revolut Pay
- #6 Remove Mercado Pago
- #7 Checkout refactor

---

## Internationalization

- Locales: `en`, `el` in `src/i18n/`
- Cookie: `flow-locale`
- Provider: root layout (`LocaleProvider`)
- Customer pages translated; admin/advisor dashboards mostly English
- **Greek dates:** nominative month names (Σεπτέμβριος, Οκτώβριος) — see `src/lib/date-locale.ts`
- Greek genitive forms from `Intl`/`date-fns` default locale are **not** used on customer pages

---

## Security integrations

| Concern | Env / file |
|---------|------------|
| MP token encryption | `ENCRYPTION_KEY` → `src/lib/encryption.ts` |
| Cron auth | `CRON_SECRET` → fail-closed in production |
| Admin guard | `src/lib/admin-auth.ts`, `admin/layout.tsx` |
| Public route allowlist | `src/proxy.ts` |

---

## Quick checklist (demo tunnel)

| Feature | Status | Notes |
|---------|--------|-------|
| Images | ✅ | Local `/public/images/` |
| Email login | ✅ | Demo accounts |
| Greek UI | ✅ | EN \| ΕΛ switcher |
| Greek dates | ✅ | Nominative months on `/book` |
| Reformer booking | ✅ | `/book` only |
| 3-slot capacity | ✅ | `siteConfig.slotCapacity` |
| EUR pricing | ✅ | `siteConfig.currency` |
| Europe/Athens TZ | ✅ | `STUDIO_TIMEZONE` |
| Google login | ❌ | Real OAuth needed |
| Payments | ❌ | Instructor MP or future Stripe |
| Blob uploads (prod) | ❌ | Needs `BLOB_READ_WRITE_TOKEN` |
