# Disaster recovery

Public recap (Actions names only) lives in `meti-booking` `AGENTS.md`.
**This file is the source of truth** for host-specific steps.

Do not invent a new restore path. Do not `--force-reset` or cancel upcoming
bookings. Do not commit plaintext `.env` or `data.db`.

Any change that affects encrypting, publishing, verifying, restoring, or
rebuilding studio data must update this file, [OPS.md](./OPS.md),
[BACKUP.md](./BACKUP.md), and the public-safe skill
`.agents/skills/meti-backup-restore/SKILL.md` in the same change.

That includes `deploy/backup-*.sh`, `deploy/restore-*.sh`,
`deploy/bootstrap-from-ops.sh`, `deploy/ci-deploy-wrapper.sh`,
`deploy/backup-crypto.sh`, and `.github/workflows/*backup*`, `*restore*`,
`*rebuild*`.

## Test without replacing live data

Actions → **Backup Production**, then **Verify Restore**. That decrypts the
backup and checks it.

## Live dress rehearsal

Actions → **Backup and Restore** → type `RESTORE`. Brief downtime. Rolls back
if `/api/health` fails.

## Same VPS (database wiped or bad deploy)

1. GitHub → `panagiod/meti-booking` → Actions → **Restore Production**
2. Backup: `latest` (or `YYYY-MM-DD`)
3. Confirm: `RESTORE`
4. The VPS pulls `backups/*.db.enc` from `panagiod/meti-studio-ops` and
   decrypts with `BACKUP_ENCRYPTION_KEY` already in `~/meti-booking/.env`

Manual on the live server:

```bash
ssh root@2.29.22.46
cd ~/meti-booking
CONFIRM=RESTORE ./deploy/restore-from-ops.sh latest
```

## VPS destroyed (new machine)

1. New Ubuntu VPS + unrestricted SSH key
2. Secrets on `meti-booking`: `RECOVERY_HOST`, `RECOVERY_USER`,
   `RECOVERY_SSH_KEY`, `BACKUP_ENCRYPTION_KEY`, `OPS_REPO_TOKEN`
3. Actions → **Rebuild Production** → Confirm `REBUILD`
4. Point `meti-pilates.com` A record at the new IP
5. `./deploy/setup-cicd.sh` and update `PRODUCTION_HOST`

Manual rebuild:

```bash
git clone https://github.com/panagiod/meti-booking.git ~/meti-booking
cd ~/meti-booking
export OPS_REPO=panagiod/meti-studio-ops
export OPS_REPO_TOKEN=...
export BACKUP_ENCRYPTION_KEY=...
CONFIRM=REBUILD ./deploy/bootstrap-from-ops.sh latest
```
