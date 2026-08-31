# Integrations — MeTi Pilates

## Images

Studio photos are **bundled locally** (reformer pilates only):

- `/public/images/hero.jpg`
- `/public/images/reformer.jpg`

Configured in `src/lib/site-config.ts`.

`next.config.ts` sets `images.unoptimized: true` because the **standalone / Cloudflare tunnel** deploy returns 404 from `/_next/image`. After any image or config change:

```bash
pnpm build && pnpm start
```

Do not rely on external Unsplash URLs — many old IDs are 404.

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
