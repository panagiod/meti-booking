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
| Vercel (with `BLOB_READ_WRITE_TOKEN`) | Vercel Blob |

API: `POST /api/admin/studio/upload` (fields: `file`, `imageKey` = `hero` \| `reformer`).

### OG image & favicons

- Dynamic: `src/app/opengraph-image.tsx` (hero photo + MeTi copy)
- Static fallback: `public/og-image.png`
- Regenerate icons: `pnpm exec tsx scripts/generate-brand-assets.ts`

`next.config.ts` sets `images.unoptimized: true` for standalone/Cloudflare tunnel deploys.

Do not use external Unsplash URLs — many return 404.

---

## Google login

Demo `.env` uses **placeholders**:

```
GOOGLE_CLIENT_ID="demo-google-client-id"
GOOGLE_CLIENT_SECRET="demo-google-client-secret"
```

### Enable Google OAuth

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

6. Rebuild and restart

> Tunnel URLs (`*.trycloudflare.com`) change when the VM restarts — update OAuth + env each time.

### Demo without Google

| Email | Password |
|-------|----------|
| `client@demo.meti-booking.local` | `Demo1234!` |

---

## Payments

### Current (Mercado Pago)

Checkout uses **Mercado Pago Checkout Pro** per instructor (non-custodial). Not configured on demo.

1. Instructor logs in: `instructor@meti-pilates.studio` / `Demo1234!`
2. **Advisor → Mercado Pago** — add test Public Key + Access Token
3. Set `APP_URL` to public domain
4. Webhook: `https://your-domain.com/api/webhooks/mercadopago`

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

---

## Quick checklist (demo tunnel)

| Feature | Status | Notes |
|---------|--------|-------|
| Images | ✅ | Local `/public/images/` |
| Email login | ✅ | Demo accounts |
| Greek UI | ✅ | EN \| ΕΛ switcher |
| Reformer booking | ✅ | `/book` only |
| 3-slot capacity | ✅ | `siteConfig.slotCapacity` |
| Google login | ❌ | Real OAuth needed |
| Payments | ❌ | Instructor MP or future Stripe |
