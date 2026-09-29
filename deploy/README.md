# VPS production deploy (Hetzner)

**Recommended stack:** native Node + Caddy + **SQLite** (~€5/month). See **[LITE.md](./LITE.md)**.

| Doc | Contents |
|-----|----------|
| **[LITE.md](./LITE.md)** | Install, deploy, backup, restore |
| **[CICD.md](./CICD.md)** | GitHub Actions → VPS auto-deploy |
| **[HETZNER.md](./HETZNER.md)** | Domain, DNS, first VPS checklist |
| **[RESEND.md](./RESEND.md)** | Booking emails |
| **[GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md)** | Google sign-in |
| **[../docs/HOSTING.md](../docs/HOSTING.md)** | Hosting overview |

## Quick deploy (lite)

```bash
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
chmod +x deploy/*.sh
./deploy/install-lite.sh
FORCE=1 ./deploy/init-env-lite.sh yourdomain.com
./deploy/deploy-lite.sh
./deploy/seed-lite.sh          # first time (ALLOW_DEMO_SEED=1 in .env)
./deploy/setup-cron.sh
./deploy/setup-cicd.sh         # optional auto-deploy
```

## Stack

```
Internet → Caddy (HTTPS) → Node.js :3000 → SQLite (data.db)
```

| Script | Role |
|--------|------|
| `deploy-lite.sh` | Build + restart systemd app |
| `init-env-lite.sh` | Generate `.env` with SQLite paths |
| `backup-studio-data.sh` | Encrypted SQLite backup |
| `restore-studio-data.sh` | Restore from encrypted backup |
| `setup-cron.sh` | Booking maintenance + alerts |
| `monitor-studio.sh` | Downtime / usage emails |
