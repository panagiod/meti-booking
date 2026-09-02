# VPS Production Deploy (Hetzner)

**Cheapest real-business hosting: ~€5/month.**

## Start here

| Doc | Contents |
|-----|----------|
| **[HETZNER.md](./HETZNER.md)** | Full step-by-step (server, DNS, Docker, HTTPS, cron) |
| **[CICD.md](./CICD.md)** | **Auto-deploy** — GitHub Actions → VPS (no manual `git pull`) |
| **[RESEND.md](./RESEND.md)** | Booking emails (Resend) |
| **[GOOGLE_OAUTH.md](./GOOGLE_OAUTH.md)** | Google sign-in |
| **[../docs/HOSTING.md](../docs/HOSTING.md)** | Hosting overview, env vars, scripts, checklist |

## Quick deploy (on the VPS)

```bash
git clone https://github.com/panagiod/meti-booking.git
cd meti-booking
cp deploy/env.production.example .env   # edit DOMAIN, secrets, passwords
chmod +x deploy/*.sh
./deploy/deploy.sh
./deploy/seed.sh                        # first time only (ALLOW_DEMO_SEED=1)
./deploy/setup-cron.sh
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
| `setup-cron.sh` | Daily booking maintenance |
| `backup-db.sh` | Postgres backups |

## Estimated monthly cost

| Item | Cost |
|---|---:|
| Hetzner CX23 (Cost-Optimized) | ~€5.49 (~$6) |
| Domain | ~$0.25–1/mo (amortized) |
| Cloudflare DNS | $0 |
| **Total** | **~$5–6/month** |

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for Vercel alternative and [../docs/CHEAPEST_HOSTING.md](../docs/CHEAPEST_HOSTING.md) for cost comparison.
