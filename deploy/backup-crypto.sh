# Shared encrypt/decrypt helpers for studio backups.
# shellcheck shell=bash

meti_write_passfile() {
  local key="$1"
  local passfile="$2"
  umask 077
  printf '%s' "$key" >"$passfile"
}

meti_key_fingerprint() {
  printf '%s' "$1" | openssl dgst -sha256 -r | awk '{print $1}'
}

meti_encrypt_file() {
  local input="$1"
  local output="$2"
  local key="$3"
  local passfile
  passfile="$(mktemp)"
  meti_write_passfile "$key" "$passfile"
  openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt \
    -pass "file:${passfile}" \
    -in "$input" \
    -out "$output"
  rm -f "$passfile"
}

meti_decrypt_file() {
  local input="$1"
  local output="$2"
  local key="$3"
  local passfile
  passfile="$(mktemp)"
  meti_write_passfile "$key" "$passfile"
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 \
    -pass "file:${passfile}" \
    -in "$input" \
    -out "$output"
  rm -f "$passfile"
}
