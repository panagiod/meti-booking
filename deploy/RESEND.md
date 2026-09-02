# Resend — booking email setup (MeTi Pilates)

Turn on **booking confirmation emails** for clients and **new-booking alerts** for the studio.

| Without Resend | With Resend |
|----------------|-------------|
| Bookings work normally | Same — plus emails |
| No confirmation email to client | ✓ “Booking confirmed” to client |
| No alert to studio | ✓ “New booking” to `tyrri_meropi@hotmail.com` |
| No 24h reminders | ✓ Reminder emails (needs cron — already installed on VPS) |

**Cost:** Resend **free tier** — 100 emails/day, 3,000/month. Enough for a small studio.

**Code:** `src/lib/email.ts` · `src/lib/notify.ts`

---

## Quick checklist (~20–30 min)

- [ ] **1.** Create account at [resend.com](https://resend.com)
- [ ] **2.** Add domain `meti-pilates.com` in Resend → copy DNS records
- [ ] **3.** Add those DNS records where `meti-pilates.com` is managed (same place as your website A record)
- [ ] **4.** Wait for Resend to show **Verified** (often 5–30 min, sometimes up to 24h)
- [ ] **5.** Create API key (`re_…`) in Resend
- [ ] **6.** SSH to Hetzner server → edit `.env` → restart app
- [ ] **7.** Test with a guest booking on https://meti-pilates.com/book

---

## What emails are sent

| When | Who gets it | Example subject |
|------|-------------|-----------------|
| Booking confirmed | Client (guest or account email) | ✓ Booking confirmed: Reformer Session |
| Booking confirmed | Studio inbox | 🔔 New booking: Reformer Session — … |
| Password reset requested | User | Reset your MeTi Pilates password |
| ~24h before class | Client + studio | ⏰ Reminder: … tomorrow |

**Studio inbox (default):** `tyrri_meropi@hotmail.com`  
Override with `STUDIO_NOTIFICATION_EMAIL` in `.env`. **Multiple inboxes:** separate with commas:

```bash
STUDIO_NOTIFICATION_EMAIL=tyrri_meropi@hotmail.com, second@example.com, second@example.com
```

Both addresses receive new-booking alerts and reminder emails.

**Password reset** also uses Resend (`/forgot-password` on the site). Without `RESEND_API_KEY`, users cannot self-reset — use the server script below.

Reminders run from the daily cron job (`/api/cron/reminders`). On your Hetzner VPS this is already set up by `./deploy/setup-cron.sh` (runs at **12:00 UTC** ≈ **14:00 Athens** in summer).

---

## Step 1 — Create a Resend account

1. Go to **[resend.com](https://resend.com)** → **Sign up** (use an email you check regularly).
2. After login, open **[Domains](https://resend.com/domains)** in the sidebar.

---

## Step 2 — Add your domain

1. Click **Add domain**.
2. Enter: **`meti-pilates.com`** (no `www`, no `https://`).
3. Resend shows a list of DNS records. **Keep this tab open** — you will copy each record exactly.

You will typically see something like:

| Type | Name / Host | Value | Notes |
|------|-------------|-------|-------|
| `TXT` | `@` or `meti-pilates.com` | `v=spf1 include:…` | SPF — authorizes Resend to send |
| `CNAME` | `resend._domainkey` | `….dkim.resend.dev` | DKIM (record 1 of 3) |
| `CNAME` | `resend2._domainkey` | `….dkim.resend.dev` | DKIM (record 2 of 3) |
| `CNAME` | `resend3._domainkey` | `….dkim.resend.dev` | DKIM (record 3 of 3) |
| `CNAME` | `send` | `….resend.dev` | Return-path (if shown) |

> **Use Resend’s exact values** — the table above is an example. Names and targets differ per account.

### Where to add DNS records

Add records wherever **`meti-pilates.com` DNS is managed** — the same panel where you pointed the website to your Hetzner server IP:

- **Cloudflare** → DNS → Records → Add record  
- **Hetzner DNS / Porkbun / Namecheap / GoDaddy** → DNS zone for `meti-pilates.com`

Your website’s **A record** (pointing to the VPS) stays as-is. You are **adding** new records for email — not replacing the A record.

### Cloudflare users — important

| Setting | What to do |
|---------|------------|
| **Proxy (orange cloud)** | **DNS only (grey cloud)** for all Resend CNAME/TXT records |
| **TTL** | Auto is fine |
| **Conflicts** | If an old SPF `TXT` on `@` exists, merge or replace per Resend’s instructions (only one SPF TXT per host) |

Orange-cloud proxy breaks DKIM verification for email DNS.

### Verify in Resend

1. After saving DNS records, go back to Resend → **Domains** → `meti-pilates.com`.
2. Click **Verify** (or wait — Resend rechecks automatically).
3. Status must show **Verified** before production email works.

**Propagation:** often 5–30 minutes; can take up to 24–48 hours. If stuck, use [dnschecker.org](https://dnschecker.org) to confirm each record is visible globally.

### Optional: sending subdomain

Instead of `@meti-pilates.com`, some studios verify **`send.meti-pilates.com`** or **`bookings.meti-pilates.com`**. If you do that, set:

```bash
EMAIL_FROM="MeTi Pilates <bookings@send.meti-pilates.com>"
```

The address after `<…>` must match a domain (or subdomain) that is **Verified** in Resend.

---

## Step 3 — Create an API key

1. Resend sidebar → **API Keys** → **Create API Key**.
2. **Name:** `metipilates-production`
3. **Permission:** **Sending access** (or Full access — both work for this app).
4. Click **Create**.
5. **Copy the key immediately** — it starts with `re_` and is shown **only once**.

Store it in a password manager. Do not commit it to git or paste it in GitHub issues.

---

## Step 4 — Add keys to your Hetzner server

Your live site runs on the VPS with **lite deploy** (no Docker). Environment variables live in:

```text
~/meti-booking/.env
```

### 4a. SSH into the server

```bash
ssh root@YOUR_SERVER_IP
```

(Use the same IP you used when setting up Hetzner — or your SSH config host alias.)

### 4b. Edit `.env`

```bash
cd ~/meti-booking
nano .env
```

Find the **Email (Resend)** section and set:

```bash
# --- Email (Resend) ---
RESEND_API_KEY=re_paste_your_key_here
EMAIL_FROM="MeTi Pilates <bookings@meti-pilates.com>"
STUDIO_NOTIFICATION_EMAIL=tyrri_meropi@hotmail.com, second@example.com
```

**Rules:**

| Variable | Rule |
|----------|------|
| `RESEND_API_KEY` | Paste the full `re_…` key, no quotes |
| `EMAIL_FROM` | **Must use double quotes** because of `<` and `>` |
| `EMAIL_FROM` address | Must be on your **verified** domain (e.g. `bookings@meti-pilates.com`) |
| `STUDIO_NOTIFICATION_EMAIL` | One or more inboxes (comma-separated) for new-booking + reminder alerts |

Also confirm these are already set (they should be from initial deploy):

```bash
APP_URL=https://meti-pilates.com
BETTER_AUTH_URL=https://meti-pilates.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://meti-pilates.com
CRON_SECRET=...   # needed for reminder emails
```

Save in nano: **Ctrl+O**, Enter, **Ctrl+X**.

### 4c. Restart the app (required)

The app only reads `RESEND_API_KEY` at startup. After editing `.env`:

```bash
cd ~/meti-booking
sudo systemctl restart meti-booking
sudo systemctl status meti-booking --no-pager
```

You should see **`active (running)`**. No full redeploy needed — restart is enough.

### 4d. Confirm the key is loaded (optional)

```bash
cd ~/meti-booking
grep RESEND_API_KEY .env
# Should show your re_ key (not empty)
```

Do **not** share this output publicly.

---

## Step 5 — Test that email works

### 5a. Book a test session

1. Open **https://meti-pilates.com/book** in a private/incognito window.
2. Pick a date and time.
3. Complete checkout as a **guest** using **your own email** (Gmail, Hotmail, etc.).
4. Finish the booking (payments are off — no card needed).

### 5b. Check inboxes

| Inbox | Expected email |
|-------|----------------|
| Email you used as guest | “Booking confirmed” |
| `tyrri_meropi@hotmail.com` | “New booking” |

Check **Spam / Junk** on Hotmail — first emails from a new domain often land there until you mark “Not junk”.

### 5c. Check Resend dashboard

1. Open **[resend.com/emails](https://resend.com/emails)** → **Logs**.
2. You should see **Delivered** (or a clear error if something failed).

If logs show **Sent** but nothing in inbox → spam folder.  
If logs show **Bounced** or **Domain not verified** → finish Step 2.

---

## Step 6 — Test reminders (optional)

Reminders are sent for appointments about **24 hours ahead**, once per day via cron.

**Manual trigger** (replace `YOUR_CRON_SECRET` with the value from `.env`):

```bash
curl -sS -X POST "https://meti-pilates.com/api/cron/reminders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Book a session for **tomorrow** if you want to test the real cron path. Otherwise the manual curl only sends reminders for appointments already in the 24h window.

**Cron schedule:** `/etc/cron.d/meti-booking` — default reminder run is **12:00 UTC** (≈ 14:00 Athens summer / 13:00 winter). Edit that file if you want a different time.

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| **No emails at all** | `RESEND_API_KEY` empty in `.env` → add key → `sudo systemctl restart meti-booking` |
| **Resend log: domain not verified** | Finish DNS in Step 2; wait for **Verified** status |
| **Resend log: 403 / invalid API key** | Create a new API key; update `.env`; restart |
| **Client gets email, studio does not** | Check `STUDIO_NOTIFICATION_EMAIL`; check Hotmail **Junk**; add sender to safe senders |
| **Emails go to spam** | Complete DKIM + SPF; verify domain; ask clients to mark “Not spam” once |
| **Error editing `.env`: `command not found` on `<`** | `EMAIL_FROM` must be quoted: `EMAIL_FROM="MeTi Pilates <bookings@meti-pilates.com>"` |
| **Links in email wrong domain** | Set `APP_URL=https://meti-pilates.com` and restart |
| **Reminders never send** | `CRON_SECRET` set? Run `./deploy/setup-cron.sh` again; appointment must be ~24h away |
| **Changed `.env` but still no email** | Did you run `sudo systemctl restart meti-booking`? |

### Hotmail / Outlook tips (`tyrri_meropi@hotmail.com`)

1. Check **Junk Email** and **Other** tabs.
2. Add `bookings@meti-pilates.com` to **Safe senders** (Settings → Mail → Junk email).
3. After domain verification, deliverability improves over a few days.

### View app logs on the server

```bash
journalctl -u meti-booking -n 100 --no-pager
```

Look for Resend or email-related errors after a test booking.

### Emergency password reset (no email)

If Resend is not set up yet, reset a user password on the server:

```bash
cd ~/meti-booking
pnpm exec tsx scripts/reset-user-password.ts user@example.com NewPassword123
sudo systemctl restart meti-booking
```

---

## Vercel deploy (if not using Hetzner)

1. Vercel project → **Settings** → **Environment Variables**.
2. Add `RESEND_API_KEY`, `EMAIL_FROM`, `STUDIO_NOTIFICATION_EMAIL` for **Production**.
3. **Redeploy** the project (env vars are baked in at build/runtime).

See also [VERCEL.md](./VERCEL.md).

---

## Security

- Treat `RESEND_API_KEY` like a password — never commit to git.
- Do not add `RESEND_API_KEY` to GitHub Actions secrets (it belongs on the server `.env` only).
- Rotate the key in Resend if it is ever exposed.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [LITE.md](./LITE.md) | Hetzner lite deploy (your current setup) |
| [HETZNER.md](./HETZNER.md) | Full VPS guide |
| [CICD.md](./CICD.md) | Auto-deploy from GitHub |
| [env.production.example](./env.production.example) | All environment variables |
