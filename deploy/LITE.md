# Lite production deploy — no Docker, SQLite (~low RAM)

**Recommended for Hetzner CX23 / 4GB VPS.** Uses ~**200–400 MB RAM** at runtime instead of **1 GB+** with Docker + PostgreSQL.

| | **Lite (recommended)** | Docker + Postgres |
|--|------------------------|-------------------|
| RAM at rest | ~200–400 MB | ~1–1.5 GB |
| Disk | Single SQLite file | Postgres volume + images |
| Deploy time | ~5–8 min (native build) | ~10–15 min (Docker build) |
| Good for | Small studio, low traffic | Higher traffic / multi-app server |

## One-time setup

```bash
cd ~/meti-booking
git pull
chmod +x deploy/*.sh

# 1. Server packages (Node 22, Caddy, swap) — once
./deploy/install-lite.sh

# 2. Environment + secrets — once
FORCE=1 ./deploy/init-env-lite.sh

# 3. Deploy
./deploy/deploy-lite.sh

# 4. Seed studio data — once
# Edit .env: ALLOW_DEMO_SEED=1 and DEMO_PASSWORD=...
./deploy/seed-lite.sh
./deploy/setup-cron.sh
./deploy/setup-cicd.sh   # optional auto-deploy from GitHub
```

## What runs

```
Internet → Caddy (native, HTTPS) → Node.js :3000 → SQLite file
```

- Database: `/var/lib/meti-booking/data.db`
- Uploads: `public/uploads/studio/`
- App process: `systemd` service `meti-booking`
- Logs: `journalctl -u meti-booking -f`

## CI/CD

Set `DEPLOY_MODE=lite` in `.env` (default in `init-env-lite.sh`).  
Every push to `main` runs `./deploy/deploy-lite.sh` via GitHub Actions — see [CICD.md](./CICD.md).

## Backup

```bash
./deploy/backup-db-lite.sh
```

Add to crontab:

```cron
0 4 * * * /root/meti-booking/deploy/backup-db-lite.sh >> /var/log/meti-booking/backup.log 2>&1
```

## Switching from Docker deploy

If you started with Docker and want lite:

```bash
docker compose -f deploy/docker-compose.prod.yml down 2>/dev/null || true
FORCE=1 ./deploy/init-env-lite.sh
./deploy/install-lite.sh
./deploy/deploy-lite.sh
./deploy/seed-lite.sh
```

SQLite starts empty — re-seed or restore a backup.

## Manual update (no CI)

```bash
cd ~/meti-booking
git pull
./deploy/deploy-lite.sh
```

## Booking emails (Resend)

Bookings work without email. To send **client confirmations** and **studio alerts** to `tyrri_meropi@hotmail.com`:

1. Verify `meti-pilates.com` in [Resend](https://resend.com/domains) (DNS records)
2. Create an API key (`re_…`)
3. Add to server `.env`: `RESEND_API_KEY`, `EMAIL_FROM`, `STUDIO_NOTIFICATION_EMAIL`
4. Restart: `sudo systemctl restart meti-booking`

Full walkthrough: **[RESEND.md](./RESEND.md)**

## Google sign-in (optional)

Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`, then restart:

```bash
sudo systemctl restart meti-booking
```

Full walkthrough: **[GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md)**

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build runs out of memory | `./deploy/install-lite.sh` adds swap; or `export NODE_OPTIONS=--max-old-space-size=2048` |
| `better-sqlite3` compile error | `apt install build-essential` (install-lite.sh does this) |
| HTTPS fails | DNS → server IP; ports 80/443 open; `systemctl status caddy` |
| Auth errors | `BETTER_AUTH_URL` must match `https://yourdomain.com` |
| No booking emails | [RESEND.md](./RESEND.md) — API key + domain verify + `systemctl restart meti-booking` |

Docker + Postgres path still available: set `DEPLOY_MODE=docker` and use `./deploy/deploy.sh` — see [HETZNER.md](./HETZNER.md).
