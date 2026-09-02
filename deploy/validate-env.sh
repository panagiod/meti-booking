#!/usr/bin/env bash
# Validate .env before bash sources it (commas and <> break unquoted values).
set -euo pipefail

ENV_FILE="${1:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

errors=0

if grep -qE '^EMAIL_FROM=[^"'\''].*<' "$ENV_FILE" 2>/dev/null; then
  echo "ERROR: EMAIL_FROM must be in double quotes (the < > breaks bash)."
  echo '  EMAIL_FROM="MeTi Pilates <bookings@meti-pilates.com>"'
  errors=1
fi

if grep -qE '^STUDIO_NOTIFICATION_EMAIL=[^"'\'' ].*,' "$ENV_FILE" 2>/dev/null; then
  echo "ERROR: STUDIO_NOTIFICATION_EMAIL contains a comma — wrap in double quotes:"
  echo '  STUDIO_NOTIFICATION_EMAIL="email1@example.com, email2@example.com"'
  errors=1
fi

if grep -qE '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' "$ENV_FILE" 2>/dev/null; then
  echo "ERROR: Found a bare email line in .env (missing variable name)."
  echo '  Use: STUDIO_NOTIFICATION_EMAIL="email1@example.com, email2@example.com"'
  errors=1
fi

if [[ "$errors" -ne 0 ]]; then
  echo ""
  echo "Fix .env on the server, then redeploy:"
  echo "  nano ~/meti-booking/.env"
  exit 1
fi
