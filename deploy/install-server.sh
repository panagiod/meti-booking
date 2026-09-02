#!/usr/bin/env bash
# First-time Ubuntu 24.04 server setup for MeTi Booking on Hetzner.
# Run as root or with sudo on a fresh VPS.
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run with sudo: sudo ./deploy/install-server.sh"
  exit 1
fi

echo "==> Updating system..."
apt-get update && apt-get upgrade -y

echo "==> Installing Docker..."
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Configuring firewall (UFW)..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "Server ready for Docker deploy."
echo ""
echo "Next steps (as deploy user, not root):"
echo "  git clone https://github.com/panagiod/meti-booking.git"
echo "  cd meti-booking"
echo "  cp deploy/env.production.example .env"
echo "  nano .env"
echo "  chmod +x deploy/*.sh"
echo "  pnpm deploy:check:hetzner   # or: npx tsx scripts/deploy-check-hetzner.ts"
echo "  ./deploy/deploy.sh"
echo "  ./deploy/setup-cron.sh"
echo "  ./deploy/smoke-test.sh https://yourdomain.com"
