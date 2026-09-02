#!/usr/bin/env bash
# First-time Ubuntu server setup — Node + Caddy, no Docker (low memory).
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: ./deploy/install-lite.sh"
  exit 1
fi

echo "==> System packages..."
apt-get update && apt-get upgrade -y
apt-get install -y curl git build-essential ufw ca-certificates gnupg sqlite3

echo "==> Node.js 22..."
if ! command -v node >/dev/null 2>&1 || [[ "$(node -p "process.versions.node.split('.')[0]")" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
corepack enable
corepack prepare pnpm@11.2.2 --activate

echo "==> Caddy (HTTPS)..."
if ! command -v caddy >/dev/null; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf "https://dl.cloudsmith.io/public/caddy/stable/gpg.key" | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf "https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt" | tee /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

echo "==> Swap (helps pnpm build on 4GB VPS)..."
if ! swapon --show | grep -q .; then
  MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
  if [[ "$MEM_MB" -lt 5000 ]]; then
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Added 2GB swap"
  fi
fi

mkdir -p /var/lib/meti-booking
mkdir -p /var/log/meti-booking

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "Lite server ready (no Docker)."
echo "Next:"
echo "  cd ~/meti-booking"
echo "  ./deploy/init-env-lite.sh"
echo "  ./deploy/deploy-lite.sh"
echo "  ./deploy/setup-cron.sh"
echo "  ./deploy/setup-cicd.sh"
