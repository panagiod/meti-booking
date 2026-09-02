#!/usr/bin/env bash
# Fix common .env syntax mistakes before sourcing (bash breaks on commas, <>, bare emails).
set -euo pipefail

ENV_FILE="${1:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  exit 0
fi

python3 - "$ENV_FILE" <<'PY'
import re
import sys
from pathlib import Path

path = Path(sys.argv[1])
text = path.read_text()
lines = text.splitlines()
out: list[str] = []
changed = False
i = 0

email_only = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\s*$")

while i < len(lines):
    line = lines[i]
    match = re.match(r"^STUDIO_NOTIFICATION_EMAIL=(.*)$", line)
    if match:
        raw = match.group(1).strip()
        unquoted = raw.strip('"').strip("'")
        extra: list[str] = []
        j = i + 1
        while j < len(lines) and email_only.match(lines[j]):
            extra.append(lines[j].strip())
            j += 1
        if extra:
            unquoted = ", ".join([unquoted, *extra]) if unquoted else ", ".join(extra)
            i = j
        else:
            i += 1
        if "," in unquoted and not (raw.startswith('"') or raw.startswith("'")):
            changed = True
        if extra:
            changed = True
        out.append(f'STUDIO_NOTIFICATION_EMAIL="{unquoted}"')
        continue

    out.append(line)
    i += 1

new_text = "\n".join(out)
if text.endswith("\n"):
    new_text += "\n"

if re.search(r'^EMAIL_FROM=[^"\'].*<', new_text, re.M):
    new_text = re.sub(
        r'^(EMAIL_FROM=)([^"\'].*<[^>]+>.*)$',
        r'\1"\2"',
        new_text,
        flags=re.M,
    )
    changed = True

if new_text != text:
    path.write_text(new_text)
    print(f"Auto-fixed syntax issues in {path}")

PY
