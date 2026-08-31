# VPS Production Deploy

Cheapest self-hosted option (~$5/month on Hetzner CX22).

## Prerequisites

- A VPS with Docker and Docker Compose
- A domain pointed to the server IP (Cloudflare DNS recommended)
- `.env` file in the project root (copy from `.env.example`)

## Required `.env` values

```bash
POSTGRES_PASSWORD=your-strong-password
DOMAIN=yourdomain.com

DATABASE_URL=postgresql://meti:your-strong-password@postgres:5432/meti_booking?schema=public
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CRON_SECRET=...
```

## Deploy

```bash
# From the repository root
docker compose -f deploy/docker-compose.prod.yml up -d --build

# Run migrations (first deploy only)
docker compose -f deploy/docker-compose.prod.yml exec app node -e "console.log('Run migrations from host: DATABASE_URL=... pnpm db:deploy')"

# Or from your machine against the VPS Postgres port (if exposed):
pnpm db:deploy
pnpm demo:setup
```

## Update Caddy domain

Set `DOMAIN` in `.env` and update `deploy/Caddyfile`:

```
yourdomain.com {
    reverse_proxy app:3000
}
```

Caddy handles HTTPS automatically via Let's Encrypt.

## Estimated monthly cost

| Item | Cost |
|---|---:|
| Hetzner CX22 | ~€4.5 (~$5) |
| Domain | ~$0.25–1/mo (amortized) |
| Cloudflare DNS/CDN | $0 |
| **Total** | **~$5–6/month** |

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for the full cost comparison and migration plan.
