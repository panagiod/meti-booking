#!/usr/bin/env bash
# Post-deploy smoke test. Usage: ./deploy/smoke-test.sh https://yourdomain.com
set -euo pipefail

BASE_URL="${1:-}"
if [[ -z "$BASE_URL" ]]; then
  echo "Usage: $0 https://yourdomain.com"
  exit 1
fi

BASE_URL="${BASE_URL%/}"

check() {
  local path="$1"
  local label="$2"
  local code
  code=$(curl -fsS -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" || echo "000")
  if [[ "$code" =~ ^(200|307|308)$ ]]; then
    echo "✓ ${label} (${code})"
  else
    echo "✗ ${label} — HTTP ${code}"
    return 1
  fi
}

echo "Smoke test: ${BASE_URL}"
echo ""

failed=0
check "/" "Homepage" || failed=1
check "/book" "Booking page" || failed=1
check "/login" "Login page" || failed=1
check "/api/studio" "Studio API (instructor configured)" || failed=1
check "/api/health" "Health API (app + database)" || failed=1
check "/api/auth/config" "Auth config API" || failed=1

echo ""
if [[ $failed -eq 0 ]]; then
  echo "All smoke tests passed."
else
  echo "Some checks failed. See: docker compose -f deploy/docker-compose.prod.yml logs app"
  exit 1
fi
