# VPS Production Deploy (Hetzner)

**Cheapest real-business hosting: ~€5/month.**

## Start here

| Doc | Contents |
|-----|----------|
| **[LITE.md](./LITE.md)** | **Recommended** — no Docker, SQLite, low RAM |
| **[HETZNER.md](./HETZNER.md)** | Docker + PostgreSQL (heavier) |
| **[CICD.md](./CICD.md)** | **Auto-deploy** — GitHub Actions → VPS (no manual `git pull`) |
| **[RESEND.md](./RESEND.md)** | Booking emails (Resend) |
| **[GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md)** | Google sign-in |
| **[../docs/HOSTING.md](../docs/HOSTING.md)** | Hosting overview, env vars, scripts, checklist |

## Quick deploy — lite (recommended, ~4GB VPS)

```bash
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
chmod +x deploy/*.sh
./deploy/install-lite.sh
./deploy/init-env-lite.sh
./deploy/deploy-lite.sh
./deploy/seed-lite.sh          # first time (ALLOW_DEMO_SEED=1 in .env)
./deploy/setup-cron.sh
```

## Quick deploy — Docker + Postgres (heavier)

```bash
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
./deploy/install-server.sh
FORCE=1 ./deploy/init-env.sh
./deploy/deploy.sh
```

## Auto-deploy (after first deploy works)

```bash
./deploy/setup-cicd.sh   # once — prints GitHub secrets to add
```

Then every push to `main` deploys automatically. See **[CICD.md](./CICD.md)**.

## Stack

```
Internet → Caddy (HTTPS) → Next.js app → PostgreSQL
```

Files:

| File | Role |
|------|------|
| `docker-compose.prod.yml` | Orchestration |
| `Dockerfile` | Production app image |
| `Caddyfile` | Automatic Let's Encrypt SSL |
| `env.production.example` | Environment template |
| `deploy.sh` | Build + migrate + start |
| `setup-cron.sh` | Daily booking maintenance + 15-minute alerts |
| `monitor-studio.sh` | Downtime and high-usage emails |
| `backup-db.sh` | Postgres backups |
| `backup-studio-data.sh` | Encrypted SQLite backup (schedule + customers) |
| `restore-studio-data.sh` | Restore an encrypted SQLite backup |

## Estimated monthly cost

| Item | Cost |
|---|---:|
| Hetzner CX23 (Cost-Optimized) | ~€5.49 (~$6) |
| Domain | ~$0.25–1/mo (amortized) |
| Cloudflare DNS | $0 |
| **Total** | **~$5–6/month** |

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for Vercel alternative and [../docs/CHEAPEST_HOSTING.md](../docs/CHEAPEST_HOSTING.md) for cost comparison.
