#!/usr/bin/env bash
# Keep logs, local backups, and build leftovers from filling the VPS disk.
# Safe to run daily and from the 15-minute monitor when disk is already high.
# Does not touch live data.db, .env, or off-server (ops-repo) backups.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

URGENT=0
if [[ "${1:-}" == "--urgent" ]]; then
  URGENT=1
fi

DATA_DIR="${METI_DATA_DIR:-/var/lib/meti-booking}"
LOG_DIR="${METI_LOG_DIR:-/var/log/meti-booking}"
REPO_BACKUP_DIR="${METI_REPO_BACKUP_DIR:-${ROOT}/deploy/backups}"
SKIP_SYSTEM="${METI_PRUNE_SKIP_SYSTEM:-0}"
DISK_PATH="${METI_DISK_PATH:-/}"

disk_percent() {
  if [[ -n "${METI_DISK_PERCENT:-}" ]]; then
    echo "${METI_DISK_PERCENT}"
    return
  fi
  df -P "$DISK_PATH" 2>/dev/null | awk 'NR==2 { gsub("%","",$5); print $5 }'
}

USED="$(disk_percent || true)"
USED="${USED:-0}"
if [[ "$USED" -ge 80 ]]; then
  URGENT=1
fi

KEEP_RAW=7
KEEP_ENC=30
KEEP_ENV=7
KEEP_REPO=7
KEEP_PRE_RESTORE=3
JOURNAL_MAX="200M"
LOG_MAX_BYTES="${METI_LOG_MAX_BYTES:-10485760}" # 10 MiB per log file

if [[ "$URGENT" -eq 1 ]]; then
  KEEP_RAW=3
  KEEP_ENC=7
  KEEP_ENV=3
  KEEP_REPO=3
  KEEP_PRE_RESTORE=1
  JOURNAL_MAX="80M"
  LOG_MAX_BYTES="${METI_LOG_MAX_BYTES:-1048576}"
fi

if [[ "$USED" -ge 92 ]]; then
  KEEP_RAW=1
  KEEP_ENC=3
  KEEP_ENV=1
  KEEP_REPO=1
  KEEP_PRE_RESTORE=1
  JOURNAL_MAX="50M"
  LOG_MAX_BYTES="${METI_LOG_MAX_BYTES:-204800}"
fi

keep_latest() {
  local keep="$1"
  local pattern="$2"
  shopt -s nullglob
  # shellcheck disable=SC2086
  local files=( $pattern )
  shopt -u nullglob
  if [[ ${#files[@]} -le $keep ]]; then
    return 0
  fi
  ls -1t "${files[@]}" | tail -n "+$((keep + 1))" | xargs -r rm -f
}

cap_file() {
  local file="$1"
  local max="$2"
  [[ -f "$file" ]] || return 0
  local size
  size="$(wc -c <"$file" | tr -d ' ')"
  if [[ "${size:-0}" -gt "$max" ]]; then
    local tmp
    tmp="$(mktemp)"
    tail -c "$max" "$file" >"$tmp"
    cat "$tmp" >"$file"
    rm -f "$tmp"
  fi
}

echo "prune-disk: disk=${USED}% urgent=${URGENT} data=${DATA_DIR} logs=${LOG_DIR}"

keep_latest "$KEEP_RAW" "${DATA_DIR}/backups/sqlite-*.db"
keep_latest "$KEEP_ENC" "${DATA_DIR}/backups/sqlite-*.db.enc"
keep_latest "$KEEP_ENV" "${DATA_DIR}/backups/env-*.enc"
keep_latest "$KEEP_PRE_RESTORE" "${DATA_DIR}/backups/pre-restore-*.db"
keep_latest "$KEEP_REPO" "${REPO_BACKUP_DIR}/sqlite-*.db.enc"
keep_latest "$KEEP_REPO" "${REPO_BACKUP_DIR}/meti-booking-*.sql.gz"

mkdir -p "$LOG_DIR"
shopt -s nullglob
for log in "${LOG_DIR}"/*.log; do
  cap_file "$log" "$LOG_MAX_BYTES"
done
shopt -u nullglob

if [[ "$SKIP_SYSTEM" != "1" ]]; then
  if command -v journalctl >/dev/null 2>&1; then
    journalctl --vacuum-size="$JOURNAL_MAX" >/dev/null 2>&1 || true
  fi
  apt-get clean >/dev/null 2>&1 || true
  if [[ "$URGENT" -eq 1 ]]; then
    rm -rf "${ROOT}/.next/cache"
    if command -v pnpm >/dev/null 2>&1; then
      pnpm store prune >/dev/null 2>&1 || true
    fi
    if command -v docker >/dev/null 2>&1; then
      docker system prune -f >/dev/null 2>&1 || true
    fi
  fi
fi

echo "prune-disk: done keep raw=${KEEP_RAW} enc=${KEEP_ENC} pre-restore=${KEEP_PRE_RESTORE}"
