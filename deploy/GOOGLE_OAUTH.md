# Google OAuth — production setup

Google sign-in is **implemented in code** (better-auth). Enable it by creating real credentials in Google Cloud and setting env vars on Vercel (or your host).

## 1. Google Cloud Console

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create or select a project
3. **APIs & Services → OAuth consent screen** — configure app name, support email, scopes (`email`, `profile`, `openid`)
4. **Credentials → Create credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**

## 2. Authorized origins

Add every URL users visit **before** redirecting to Google:

| Environment | Authorized JavaScript origins |
|---|---|
| Local dev | `http://localhost:3000` |
| Vercel production | `https://your-app.vercel.app` |
| Custom domain | `https://yourdomain.com` |

> Preview deploys (`*.vercel.app` per branch) each need their own origin **or** use a fixed staging URL. Google does not support wildcards.

## 3. Authorized redirect URIs

Add **exactly** (no trailing slash):

```
https://your-app.vercel.app/api/auth/callback/google
```

For local dev:

```
http://localhost:3000/api/auth/callback/google
```

The path is fixed by better-auth: `/api/auth/callback/google`.

## 4. Environment variables

Set on Vercel → Settings → Environment Variables:

```bash
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
BETTER_AUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app
```

**Important:** `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` must match the public URL users see. Mismatch causes redirect/cookie errors.

### Multiple domains (custom + vercel.app)

If you serve the app from more than one origin during migration:

```bash
BETTER_AUTH_TRUSTED_ORIGINS=https://your-app.vercel.app,https://yourdomain.com
```

## 5. Redeploy

After changing env vars, trigger a **new deployment** on Vercel (env is read at runtime/build for server components).

## 6. Smoke test

1. Open `/login` — **Continue with Google** button should appear (hidden when creds are missing/demo)
2. Click → Google consent → redirect to `/redirect` → role dashboard
3. New users get a `CLIENT` profile automatically

## Demo / local without Google

Demo `.env` uses placeholders (`demo-google-client-id`). The Google button is **hidden** automatically. Use email/password:

| Email | Password |
|---|---|
| `client@demo.meti-booking.local` | `Demo1234!` |

## Troubleshooting

| Symptom | Fix |
|---|---|
| Button missing on `/login` | Set real `GOOGLE_CLIENT_ID` / `SECRET` (not demo placeholders) |
| `redirect_uri_mismatch` | Add exact callback URL in Google Console |
| Login succeeds but session lost | `BETTER_AUTH_URL` must match browser URL; check `BETTER_AUTH_TRUSTED_ORIGINS` |
| Works on prod, not preview | Add preview URL to Google Console origins + redirect URIs |

See also [VERCEL.md](./VERCEL.md) and [../docs/INTEGRATIONS.md](../docs/INTEGRATIONS.md).
