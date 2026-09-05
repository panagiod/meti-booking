# MeTi Pilates — Admin guide

How to manage the studio from the **admin dashboard** (`/admin`).

**Login:** `admin@demo.meti-booking.local` / `Demo1234!`

## Promoting a Google-login user to admin (via CI, no SSH)

A Google sign-in always creates a normal client — there is no "make admin"
button. To grant admin to an existing Google account without SSHing into
the server, use the **Promote Admin** GitHub Action:

1. One-time setup: generate a token with `openssl rand -hex 32`, add it to
   the server `.env` as `ADMIN_PROMOTE_TOKEN` (then restart the app), and
   add the same value as the `ADMIN_PROMOTE_TOKEN` secret at
   https://github.com/panagiod/meti-booking/settings/secrets/actions.
2. Ask the user to sign in with Google at least once (their row must exist).
3. GitHub → **Actions** → **Promote Admin** → **Run workflow** → enter their
   email.

This calls `POST /api/ops/promote-admin` (`src/app/api/ops/promote-admin/route.ts`),
which sets `role = ADMIN`, clears any leftover advisor/client profile, and
revokes existing sessions so they must sign in again. See
`.github/workflows/promote-admin.yml`.

---

## Admin navigation

| Page | URL | Purpose |
|------|-----|---------|
| **Overview** | `/admin` | This week’s board, today’s counts, shortcuts |
| **Bookings** | `/admin/bookings` | Upcoming sessions, cancel/free a slot, book for a client |
| **Clients** | `/admin/users` | Client list with phone and session dates |
| **Hours** | `/admin/schedule` | Weekly open days, times, lunch, gap |
| **Closures** | `/admin/closures` | Cyprus holidays + extra days off |
| **Website** | `/admin/content` | Homepage text, images, contact info |

The admin UI follows the site language (Greek by default, `EN | ΕΛ` in the sidebar). Legacy marketplace pages (`/admin/blog`, `/admin/invoices`, `/admin/config`) stay off the sidebar and remain English.

---

## Hours (`/admin/schedule`)

Controls when customers can book on the public `/book` page. Holidays and extra days off are managed on **Closures** (`/admin/closures`).

### Default schedule (demo seed)

| Setting | Value |
|---------|--------|
| Open days | **Tuesday, Thursday, Saturday** (admin can change to any days) |
| Hours | **Tue/Thu 15:45–18:00**, **Sat 08:00–12:45** (45 min classes) |

### What you can do

1. **Enable any days** — toggle Mon–Sun; at least one day required to save
2. **Set start/end times** per day — each day can have different hours
3. **Set gap between slots** — minutes between session start times (default 10)
4. **Set lunch break** — optional `lunch start` / `lunch end` to block mid-day slots
5. **Save schedule** — updates public booking immediately
6. **Block dates** — use **Closures**; blocked days are hidden from `/book`.  
   For a **single day**, set the same **From** and **To** date.

### APIs (admin auth required)

| Method | Route |
|--------|-------|
| `GET` | `/api/admin/studio` — instructor + schedule summary |
| `GET/PUT` | `/api/admin/studio/schedule` |
| `GET/POST/DELETE` | `/api/admin/studio/blocked-times` |

Blocked times are respected by `GET /api/slots`.

---

## Closures (`/admin/closures`)

Cyprus public holidays close the studio automatically. Add extra vacation or days off here. For a **single day**, set the same **From** and **To** date.

---

## Website content (`/admin/content`)

CMS for the public customer site. Content is stored in the **`studio_content`** database table (singleton row `id: "default"`).

### Tabs

#### English / Greek (ΕΛ)

Editable per language:

| Field | Where it appears |
|-------|------------------|
| Page title | Browser tab, SEO |
| Meta description | SEO / link previews |
| Hero eyebrow | Small label above headline |
| Hero headline | Main homepage title |
| Hero description | Paragraph under headline |
| Book button | CTA on homepage |
| Hero image alt | Accessibility |
| Hours line | Under hero + footer area |

#### Images & contact

| Field | Where it appears |
|-------|------------------|
| Studio name | Logo, footer, booking header |
| Address / location | Hero footer, site footer |
| Phone | Contact (if linked) |
| Email | Footer contact link |
| Price from (€) | Hero price line |
| Hero image | Homepage large photo |
| Reformer image | Secondary studio photo |

### Image uploads

- Formats: JPEG, PNG, WebP (max 5MB)
- **Local dev:** saved to `public/uploads/studio/`
- **Hetzner VPS:** set `SELF_HOSTED=1` in `.env` — saves to persistent Docker volume (see [docs/HOSTING.md](./HOSTING.md))
- **Vercel production:** requires `BLOB_READ_WRITE_TOKEN` (Vercel Blob); returns 503 without it
- Click **Replace image** → file uploads immediately; click **Save changes** to persist URL in DB

### How it reaches the public site

1. Admin saves → `PUT /api/admin/studio/content`
2. Customer pages fetch → `GET /api/studio/content`
3. `LocaleProvider` merges DB copy over default `en.ts` / `el.ts` strings
4. `useStudioBranding()` provides name, location, email, images

**Fallback:** if no DB row exists, defaults come from `site-config.ts` + locale files.

### APIs

| Method | Route | Auth |
|--------|-------|------|
| `GET` | `/api/studio/content` | Public |
| `GET/PUT` | `/api/admin/studio/content` | Admin |
| `POST` | `/api/admin/studio/upload` | Admin |

### Key files

| File | Role |
|------|------|
| `src/lib/studio-content-types.ts` | Zod schema + TypeScript types |
| `src/lib/studio-content.ts` | Defaults, merge helpers |
| `src/lib/studio-content-server.ts` | DB read/write + seed |
| `src/app/(platform)/admin/content/page.tsx` | Admin UI |
| `src/components/providers/locale-provider.tsx` | Loads + merges content client-side |

---

## Persistence

All admin changes are stored in PostgreSQL:

| Admin action | Stored in | Notes |
|--------------|-----------|-------|
| Calendar days/hours | `advisor_schedule` | Also updates EN/EL **hours line** in CMS |
| Blocked dates | `blocked_time` | Saved immediately |
| Website text | `studio_content` | Click **Save changes** |
| Image upload | `studio_content` | Saved immediately on upload |

Re-running `pnpm demo:setup` **does not** overwrite existing calendar or CMS data.

| Command | Effect |
|---------|--------|
| `pnpm demo:setup -- --reset` | Re-seed schedule + services |
| `pnpm demo:setup -- --reset-content` | Reset website CMS to defaults |

---

## Security

- **Admin pages** (`/admin/*`) require `role === ADMIN` — enforced server-side in `admin/layout.tsx`
- **Admin APIs** (`/api/admin/*`) require admin session via `requireAdminSession()`
- **Proxy** (`src/proxy.ts`) redirects unauthenticated users; public booking APIs (`/api/studio`, `/api/advisors`, `/api/slots`) are allowlisted

---

## After changing content

- **Calendar:** effective immediately on save (no rebuild); hours line in footer/hero updates automatically
- **Website text:** effective after **Save changes**
- **Images:** effective immediately after upload
- **Code defaults** (`site-config.ts`, `en.ts`, `el.ts`): only affect new installs before first admin save or if DB row deleted

Re-seed schedule defaults only:

```bash
pnpm demo:setup -- --reset
```

Reset website CMS only:

```bash
pnpm demo:setup -- --reset-content
```

---

## Related

- [PROJECT.md](./PROJECT.md) — full architecture
- [DEMO.md](./DEMO.md) — local setup
