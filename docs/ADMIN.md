# MeTi Pilates — Admin guide

How to manage the studio from the **admin dashboard** (`/admin`).

**Login:** `admin@demo.meti-booking.local` / `Demo1234!`

---

## Admin navigation

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin` | Platform stats overview |
| Advisors | `/admin/advisors` | Approve/suspend instructors (legacy) |
| Verification | `/admin/verification` | Document review (legacy) |
| Users | `/admin/users` | User list |
| **Calendar** | `/admin/schedule` | **Weekly booking hours + block dates** |
| **Website** | `/admin/content` | **Homepage text, images, contact info** |
| Blog | `/admin/blog` | Blog posts (legacy) |
| Billing | `/admin/invoices` | Invoices (legacy) |
| Settings | `/admin/config` | Category pricing (legacy marketplace) |

For MeTi Pilates day-to-day operations, use **Calendar** and **Website**.

---

## Calendar (`/admin/schedule`)

Controls when customers can book on the public `/book` page.

### Default schedule (demo seed)

| Setting | Value |
|---------|--------|
| Open days | **Tuesday, Thursday, Saturday** (max 3 per week) |
| Hours | **14:00–17:00** (3 afternoon hours) |
| Slots per day | **3** (50 min session + 10 min gap) |
| Capacity per slot | **3 clients** (reformer machines) |

### What you can do

1. **Enable/disable days** — toggle Mon–Sun; max **3 active days** enforced
2. **Set start/end times** per day — preview shows slot count
3. **Save schedule** — updates public booking immediately
4. **Block dates** — holidays/closures; blocked days hidden from `/book`

### APIs (admin auth required)

| Method | Route |
|--------|-------|
| `GET` | `/api/admin/studio` — instructor + schedule summary |
| `GET/PUT` | `/api/admin/studio/schedule` |
| `GET/POST/DELETE` | `/api/admin/studio/blocked-times` |

Blocked times are respected by `GET /api/slots`.

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
- **Production (Vercel):** uses Vercel Blob if `BLOB_READ_WRITE_TOKEN` is set
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

## After changing content

- **Calendar:** effective immediately on save (no rebuild)
- **Website text/images:** effective after save; customer may need refresh (no CDN cache on API)
- **Code defaults** (`site-config.ts`, `en.ts`, `el.ts`): only affect new installs before first admin save or if DB row deleted

Re-seed defaults:

```bash
pnpm demo:setup
```

---

## Related

- [PROJECT.md](./PROJECT.md) — full architecture
- [DEMO.md](./DEMO.md) — local setup
