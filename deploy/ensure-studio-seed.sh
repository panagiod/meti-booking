#!/usr/bin/env bash
# Ensure studio has an active instructor (seed if missing). Idempotent.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
[[ -f .env ]] && source .env

STUDIO_CODE="$(curl -fsS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/studio 2>/dev/null || echo 000)"
if [[ "$STUDIO_CODE" == "200" ]]; then
  echo "Studio already configured (/api/studio → 200)"
  exit 0
fi

echo "Studio not configured (/api/studio → ${STUDIO_CODE}) — seeding..."

if ! grep -q '^DEMO_PASSWORD=' .env 2>/dev/null; then
  DEMO_PW="$(openssl rand -base64 12)"
  echo "DEMO_PASSWORD=${DEMO_PW}" >> .env
  echo "Generated DEMO_PASSWORD in .env"
fi

if grep -q '^ALLOW_DEMO_SEED=' .env 2>/dev/null; then
  sed -i 's/^ALLOW_DEMO_SEED=.*/ALLOW_DEMO_SEED=1/' .env
else
  echo 'ALLOW_DEMO_SEED=1' >> .env
fi

# shellcheck disable=SC1091
source .env
./deploy/seed-lite.sh

systemctl restart meti-booking
sleep 3

STUDIO_CODE="$(curl -fsS -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/studio 2>/dev/null || echo 000)"
if [[ "$STUDIO_CODE" != "200" ]]; then
  echo "ERROR: Seed completed but /api/studio still returns ${STUDIO_CODE}"
  exit 1
fi

sed -i 's/^ALLOW_DEMO_SEED=.*/ALLOW_DEMO_SEED=0/' .env
echo "Studio seeded successfully."
