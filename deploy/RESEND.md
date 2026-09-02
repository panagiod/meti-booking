# Resend — booking email setup

The app sends transactional email through **[Resend](https://resend.com)**. Emails are **optional**: if `RESEND_API_KEY` is not set, bookings still work — nothing is sent.

**Code:** `src/lib/email.ts` · `src/lib/notify.ts`

---

## What gets emailed

| When | Recipient | Subject (example) |
|------|-----------|-------------------|
| Booking confirmed | Client (guest or account email) | ✓ Booking confirmed: Reformer Session |
| Booking confirmed | Studio (`STUDIO_NOTIFICATION_EMAIL`) | 🔔 New booking: Reformer Session — … |
| 24h before class | Client + studio | ⏰ Reminder: … tomorrow |

**Default studio inbox:** `tyrri_meropi@hotmail.com` (override with `STUDIO_NOTIFICATION_EMAIL`).

Reminders run from the daily cron job (`/api/cron/reminders`) — requires `CRON_SECRET` and a working cron (Vercel crons or `deploy/setup-cron.sh` on VPS).

---

## Cost

| Plan | Limit | Enough for MeTi? |
|------|-------|------------------|
| **Resend Free** | 100 emails/day, 3,000/month | ✅ Yes for a small studio |
| Paid | Higher volume | Only if you outgrow free tier |

No monthly fee on the free tier.

---

## Step 1 — Create a Resend account

1. Go to [resend.com](https://resend.com) and sign up.
2. Open the [Resend dashboard](https://resend.com/domains).

---

## Step 2 — Verify your domain (`metipilates.com`)

To send **from** `@metipilates.com` (recommended), you must verify the domain.

1. **Domains → Add domain** → enter `metipilates.com`.
2. Resend shows DNS records to add at your domain registrar (or Cloudflare):
   - **DKIM** — usually 3 `CNAME` records
   - **SPF** — `TXT` on the root or `send` subdomain (follow Resend’s exact values)
   - **Return-path** — optional `CNAME` (Resend may show this)
3. Add the records where **metipilates.com** DNS is managed.
4. In Resend, click **Verify**. Propagation can take a few minutes up to 48 hours.

> **Without domain verification** you can only send from Resend’s test address (`onboarding@resend.dev`) and only **to the email you signed up with**. That is not enough for real clients — verify `metipilates.com` before launch.

### Using a subdomain (optional)

Some studios use `mail.metipilates.com` or `bookings.metipilates.com` as the sending domain. Add that subdomain in Resend instead and set:

```bash
EMAIL_FROM="MeTi Pilates <bookings@bookings.metipilates.com>"
```

---

## Step 3 — Create an API key

1. **API Keys → Create API Key**
2. Name: e.g. `metipilates-production`
3. Permission: **Sending access** (full access is fine if you only use this project)
4. Copy the key — it starts with `re_` and is shown **once**.

---

## Step 4 — Environment variables

Add to your host (Vercel → Settings → Environment Variables, or `.env` on Hetzner):

```bash
# Required for email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Must use an address on your verified domain
EMAIL_FROM="MeTi Pilates <bookings@metipilates.com>"

# Who receives new-booking + reminder alerts (defaults to studio contact email)
STUDIO_NOTIFICATION_EMAIL=tyrri_meropi@hotmail.com
```

Also ensure the public URL is set (used in email links):

```bash
APP_URL=https://metipilates.com
BETTER_AUTH_URL=https://metipilates.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://metipilates.com
```

### Hetzner VPS

Edit `.env` in the project root (from `deploy/env.production.example`), then redeploy:

```bash
./deploy/deploy.sh
```

### Vercel

Set variables for **Production** (and Preview if you want emails on preview deploys). **Redeploy** after saving.

---

## Step 5 — Smoke test

1. Open `https://metipilates.com/book` (or your live URL).
2. Book a session as a **guest** with an email you can check.
3. Complete checkout (booking-only flow — no payment).
4. Check:
   - **Client inbox** — “Booking confirmed”
   - **tyrri_meropi@hotmail.com** — “New booking”

If nothing arrives:

- Confirm `RESEND_API_KEY` is set on the **running** environment (redeploy after changes).
- Check [Resend → Logs](https://resend.com/emails) for bounces or errors.
- Check spam/junk folders.
- Ensure `EMAIL_FROM` uses your **verified** domain.

### Test reminder emails (optional)

Reminders are sent by cron for appointments ~24h ahead. On VPS, cron is installed via `./deploy/setup-cron.sh`. On Vercel, `vercel.json` runs `/api/cron/reminders` once per day.

Manual test (replace values):

```bash
curl -X POST "https://metipilates.com/api/cron/reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No emails at all | `RESEND_API_KEY` missing or app not redeployed |
| “Domain not verified” in Resend logs | Finish DNS verification for `metipilates.com` |
| Client gets mail, studio does not | Check `STUDIO_NOTIFICATION_EMAIL` and Hotmail spam |
| Emails go to spam | Complete DKIM + SPF; use a proper `From` name; avoid all-caps subjects |
| Links in email point to wrong host | Set `APP_URL=https://metipilates.com` and redeploy |
| Reminders never send | Cron not configured; `CRON_SECRET` wrong; appointment not within 24h window |

---

## Security notes

- Treat `RESEND_API_KEY` like a password — never commit it to git.
- Use a **domain-scoped** API key if Resend offers it.
- Rotate the key if it is ever exposed.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [HETZNER.md](./HETZNER.md) | VPS deploy (cheapest production) |
| [VERCEL.md](./VERCEL.md) | Vercel deploy |
| [GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md) | Google sign-in |
| [../docs/HOSTING.md](../docs/HOSTING.md) | Hosting overview |
| [../docs/CHEAPEST_HOSTING.md](../docs/CHEAPEST_HOSTING.md) | $0 vs paid hosting |
| [../.env.example](../.env.example) | All environment variables |
