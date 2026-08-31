# Integrations — Google login & payments

## Why images looked broken

The site uses Next.js `Image` optimization (`/_next/image?...`). On the **standalone/tunnel demo**, that optimizer was returning **404**, so photos appeared missing or broken.

**Fix applied:** `unoptimized: true` in `next.config.ts` so images load directly from Unsplash.

After deploy, rebuild and restart:

```bash
pnpm build && pnpm start
```

For production on Vercel/Render, you can remove `unoptimized` if images work there.

---

## Why Google login does not work (demo)

The demo `.env` uses **placeholder** credentials:

```
GOOGLE_CLIENT_ID="demo-google-client-id"
GOOGLE_CLIENT_SECRET="demo-google-client-secret"
```

Google will reject sign-in until you use real OAuth credentials.

### Enable Google login

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. **Authorized JavaScript origins:**
   - `https://your-domain.com`
   - `http://localhost:3000` (for local dev)
4. **Authorized redirect URIs:**
   - `https://your-domain.com/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`
5. Set environment variables on your host:

   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   BETTER_AUTH_URL=https://your-domain.com
   NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com
   APP_URL=https://your-domain.com
   ```

6. Redeploy / restart the app

> **Important:** If your public URL changes (e.g. a new `*.trycloudflare.com` link), you must add that exact URL to Google OAuth origins + redirect URIs, and update `BETTER_AUTH_URL` / `APP_URL`.

### Demo without Google

Use **email + password**:

| Email | Password |
|---|---|
| `client@demo.meti-booking.local` | `Demo1234!` |

---

## Payments — Google Pay / Apple Pay

This app does **not** integrate Google Pay or Apple Pay directly.

**Payments use [Mercado Pago](https://www.mercadopago.com) Checkout Pro** (card, PSE, etc.). In some countries, Mercado Pago’s checkout may also show **Google Pay / Apple Pay** if:

- Your Mercado Pago seller account supports them
- The buyer’s device/browser supports them
- You are in a supported region

That is configured in **Mercado Pago**, not in this codebase.

### Enable payments (required for checkout)

1. **Create a Mercado Pago developer account**  
   [mercadopago.com/developers](https://www.mercadopago.com/developers)

2. **Create an application** and get:
   - Public Key
   - Access Token (use **test** credentials first)

3. **Sign in as the studio instructor** (advisor account):
   - Demo: `instructor@flowpilates.studio` / `Demo1234!`
   - Go to **Advisor dashboard → Mercado Pago**
   - Paste Public Key + Access Token
   - Set mode to **TEST** for sandbox payments

4. **Set your public URL** in environment variables:

   ```
   APP_URL=https://your-domain.com
   BETTER_AUTH_URL=https://your-domain.com
   ```

   Mercado Pago redirects and webhooks use `APP_URL`.

5. **Webhook** (production): In Mercado Pago, set notification URL to:

   ```
   https://your-domain.com/api/webhooks/mercadopago
   ```

6. **Test a booking:** Book a session → checkout → pay with Mercado Pago **test cards** (see MP docs for your country).

### Without Mercado Pago

Checkout fails with *“Advisor has no Mercado Pago account configured”* because each instructor must connect their own MP account (non-custodial model).

---

## Quick checklist

| Feature | Status on demo tunnel | What you need |
|---|---|---|
| Images | Fixed after rebuild | `unoptimized: true` + rebuild |
| Email login | Works | Demo client account above |
| Google login | Not configured | Real OAuth client + env vars |
| Card payments | Not configured | Instructor MP test credentials |
| Google / Apple Pay | Via Mercado Pago only | MP account + supported region |
