#!/usr/bin/env bash
# Install daily cron jobs for booking maintenance (expire, reminders, cleanup).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env"
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

for var in DOMAIN CRON_SECRET; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required env var: $var"
    exit 1
  fi
done

CRON_FILE="/etc/cron.d/meti-booking"
BASE_URL="https://${DOMAIN}"

sudo tee "$CRON_FILE" > /dev/null <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
CRON_SECRET=${CRON_SECRET}

# Expire unpaid pending bookings (midnight UTC)
0 0 * * * root curl -fsS -H "Authorization: Bearer \${CRON_SECRET}" ${BASE_URL}/api/cron/expire-pending >/dev/null 2>&1

# Booking reminders (noon UTC — adjust for Athens if needed)
0 12 * * * root curl -fsS -H "Authorization: Bearer \${CRON_SECRET}" ${BASE_URL}/api/cron/reminders >/dev/null 2>&1

# Cleanup old cancelled appointments (03:00 UTC)
0 3 * * * root curl -fsS -H "Authorization: Bearer \${CRON_SECRET}" ${BASE_URL}/api/cron/cleanup-cancelled >/dev/null 2>&1
EOF

sudo chmod 644 "$CRON_FILE"
echo "Cron jobs installed at $CRON_FILE"
echo "Reminder job runs at 12:00 UTC (= 14:00 Athens in summer, 13:00 in winter). Edit the file to change times."
