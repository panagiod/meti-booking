#!/usr/bin/env bash
# Build and start production stack on the VPS.
# Run from repository root: ./deploy/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy deploy/env.production.example to .env and fill in values."
  exit 1
fi

# shellcheck disable=SC1091
./deploy/fix-env-syntax.sh .env
./deploy/validate-env.sh .env
if grep -qE '^EMAIL_FROM=[^"'\''].*<' .env 2>/dev/null; then
  echo "ERROR: .env line EMAIL_FROM must be in double quotes (the < > breaks bash)."
  echo '  EMAIL_FROM="MeTi Pilates <bookings@meti-pilates.com>"'
  exit 1
fi
set -a
source .env
set +a

for var in DOMAIN POSTGRES_PASSWORD BETTER_AUTH_SECRET BETTER_AUTH_URL CRON_SECRET; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required env var: $var"
    exit 1
  fi
done

echo "Starting database..."
docker compose -f deploy/docker-compose.prod.yml up -d postgres

echo "Waiting for Postgres..."
POSTGRES_USER="${POSTGRES_USER:-meti}"
POSTGRES_DB="${POSTGRES_DB:-meti_booking}"
for i in $(seq 1 30); do
  if docker compose -f deploy/docker-compose.prod.yml exec -T postgres \
    pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "Postgres did not become ready in time."
    exit 1
  fi
  sleep 2
done

echo "Running database migrations..."
docker compose -f deploy/docker-compose.prod.yml --profile tools run --rm migrate

echo "Building and starting app + Caddy..."
docker compose -f deploy/docker-compose.prod.yml up -d --build

echo ""
echo "Deploy complete."
echo "  Site: https://${DOMAIN}"
echo ""
echo "Next steps:"
echo "  1. Seed studio data (first time): ./deploy/seed.sh"
echo "  2. Install cron jobs: ./deploy/setup-cron.sh"
echo "  3. Smoke test: ./deploy/smoke-test.sh https://${DOMAIN}"
