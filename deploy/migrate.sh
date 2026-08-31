#!/usr/bin/env bash
# Apply Prisma migrations against the production Postgres container.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

docker compose -f deploy/docker-compose.prod.yml --profile tools run --rm migrate

echo "Migrations applied."
