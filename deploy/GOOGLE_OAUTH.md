# Google sign-in — production setup (MeTi Pilates)

Google login is **already built in**. The **“Continue with Google”** button appears on `/login` and `/register` only after you add real Google OAuth credentials to the server.

**Cost:** Free (Google Cloud OAuth has no charge for normal sign-in volume).

**Code:** `src/lib/auth.ts` · `src/lib/google-oauth.ts`

---

## Quick checklist (~15–20 min)

- [ ] **1.** Create a Google Cloud project
- [ ] **2.** Configure OAuth consent screen
- [ ] **3.** Create OAuth 2.0 Web client credentials
- [ ] **4.** Add `https://meti-pilates.com` origin + callback URL in Google Console
- [ ] **5.** Copy Client ID + Client Secret
- [ ] **6.** Add to Hetzner server `.env` → restart app
- [ ] **7.** Test at https://meti-pilates.com/login

---

## Step 1 — Google Cloud project

1. Open **[Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)**
2. Sign in with a Google account you control (studio or personal is fine).
3. Top bar → **Select a project** → **New project**
   - Name: e.g. `MeTi Pilates`
   - Click **Create**

---

## Step 2 — OAuth consent screen

1. Left menu → **APIs & Services** → **OAuth consent screen**
2. User type:
   - **External** — normal choice (anyone with a Google account can sign in)
   - **Internal** — only if you use Google Workspace for the whole studio
3. Fill in:
   - **App name:** `MeTi Pilates` (or `Meropi Tirri`)
   - **User support email:** your email
   - **Developer contact email:** your email
4. **Scopes** → Add:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. **Test users** (while app is in *Testing* mode):
   - Add emails that should be allowed to sign in during testing
6. Save.

> **Publishing:** While status is **Testing**, only **test users** you added can sign in. When ready for everyone, click **Publish app** on the consent screen. Basic email/profile scopes usually do not need Google verification.

---

## Step 3 — Create OAuth credentials

1. **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name: e.g. `meti-pilates-production`

### Authorized JavaScript origins

Add **exactly** (no trailing slash):

```text
https://meti-pilates.com
```

Optional for local dev on your laptop:

```text
http://localhost:3000
```

### Authorized redirect URIs

Add **exactly** (no trailing slash):

```text
https://meti-pilates.com/api/auth/callback/google
```

Optional for local dev:

```text
http://localhost:3000/api/auth/callback/google
```

4. Click **Create**
5. Copy:
   - **Client ID** — ends in `.apps.googleusercontent.com`
   - **Client secret** — starts with `GOCSPX-`

Keep the secret private — never commit it to git.

---

## Step 4 — Add credentials to your Hetzner server

SSH into the server:

```bash
ssh root@YOUR_SERVER_IP
cd ~/meti-booking
nano .env
```

Add or update:

```bash
GOOGLE_CLIENT_ID=123456789-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
BETTER_AUTH_URL=https://meti-pilates.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://meti-pilates.com
```

`BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` should already match your domain. **They must match the URL in the browser** or sign-in will fail after the Google redirect.

Save (`Ctrl+O`, Enter, `Ctrl+X`), then restart:

```bash
sudo systemctl restart meti-booking
sudo systemctl status meti-booking --no-pager
```

No full redeploy needed — restart is enough after `.env` changes.

---

## Step 5 — Smoke test

1. Open **https://meti-pilates.com/login** (hard refresh / incognito).
2. You should see **“Continue with Google”** above the email form.
3. Click it → Google account picker → consent → redirect back to the site.
4. You land on your dashboard (new users get a **CLIENT** account automatically).

Also test **https://meti-pilates.com/register** — same Google button appears there.

---

## If the button does not appear

| Check | Fix |
|-------|-----|
| Button missing | `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` empty or still demo placeholders in `.env` |
| Still missing after edit | Run `sudo systemctl restart meti-booking` |
| `redirect_uri_mismatch` | Redirect URI in Google Console must be exactly `https://meti-pilates.com/api/auth/callback/google` |
| `access_denied` / app not verified | Add your Google account under **OAuth consent screen → Test users**, or **Publish app** |
| Login works then session lost | `BETTER_AUTH_URL` must be `https://meti-pilates.com` (not `http://`, not wrong domain) |
| Works on desktop, not mobile | Same domain — usually a cookie/cache issue; try incognito |

---

## Linking Google to an existing email/password account

If someone already registered with **email + password**, signing in with **Google using the same email** should link the accounts automatically (better-auth account linking is enabled).

If they use a **different** Google email, that creates a **separate** account.

---

## Vercel deploy (if not using Hetzner)

1. Vercel project → **Settings** → **Environment Variables**
2. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`
3. Add the same origins + redirect URIs in Google Console for your Vercel URL
4. **Redeploy**

See [VERCEL.md](./VERCEL.md).

### Multiple domains during migration

```bash
BETTER_AUTH_TRUSTED_ORIGINS=https://meti-pilates.com,https://your-app.vercel.app
```

Add **both** origins and redirect URIs in Google Console.

---

## Security notes

- Treat `GOOGLE_CLIENT_SECRET` like a password.
- Restrict OAuth credentials in Google Console to your real domains only.
- Rotate the secret in Google Console if it is ever exposed.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [RESEND.md](./RESEND.md) | Booking + password-reset emails |
| [LITE.md](./LITE.md) | Hetzner lite deploy |
| [HETZNER.md](./HETZNER.md) | Full VPS guide |
| [../docs/INTEGRATIONS.md](../docs/INTEGRATIONS.md) | Integrations overview |
