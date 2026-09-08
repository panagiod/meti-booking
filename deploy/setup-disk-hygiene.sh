#!/usr/bin/env bash
# Install journald + logrotate caps, then prune leftover files.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "${METI_PRUNE_SKIP_SYSTEM:-0}" == "1" ]]; then
  echo "Skipping disk-hygiene install (METI_PRUNE_SKIP_SYSTEM=1)"
  exit 0
fi

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Skipping disk-hygiene install (not root)"
  exit 0
fi

install -d -m 755 /etc/systemd/journald.conf.d /etc/logrotate.d /var/log/meti-booking
install -m 644 "${ROOT}/deploy/journald-meti-booking.conf" /etc/systemd/journald.conf.d/meti-booking.conf
install -m 644 "${ROOT}/deploy/logrotate-meti-booking" /etc/logrotate.d/meti-booking

if command -v systemctl >/dev/null 2>&1; then
  systemctl restart systemd-journald || true
fi

chmod +x "${ROOT}/deploy/prune-disk.sh"
"${ROOT}/deploy/prune-disk.sh" || true
echo "Disk hygiene installed (journald 200M cap, logrotate, prune-disk)."
