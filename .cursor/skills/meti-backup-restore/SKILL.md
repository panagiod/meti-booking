---
name: meti-backup-restore
description: MeTi Pilates production backup, verify, restore, and rebuild. Use when changing backup or restore scripts, ops repo publish, disaster recovery, or GitHub Actions for Backup / Verify Restore / Restore / Rebuild.
---

# MeTi backup and restore

Source of truth for humans: **[deploy/OPS.md](../../../deploy/OPS.md)** and **[deploy/BACKUP.md](../../../deploy/BACKUP.md)**.  
Agent recap: **[AGENTS.md](../../../AGENTS.md)** → Disaster recovery.

## Rule

If a change affects backup or restore, update the procedures in the **same commit**. Do not ship a new path while the runbooks still describe the old one.

Update all of:

- [deploy/OPS.md](../../../deploy/OPS.md)
- [deploy/BACKUP.md](../../../deploy/BACKUP.md)
- [AGENTS.md](../../../AGENTS.md) Disaster recovery
- this skill, if the steps or file list changed

That includes edits to:

- `deploy/backup-studio-data.sh`, `deploy/publish-ops-from-server.sh`, `deploy/backup-crypto.sh`
- `deploy/restore-from-ops.sh`, `deploy/restore-studio-data.sh`, `deploy/bootstrap-from-ops.sh`
- `deploy/ci-deploy-wrapper.sh`, `deploy/ensure-backup-key.sh`
- `.github/workflows/backup-production.yml`, `verify-restore.yml`, `restore-production.yml`, `rebuild-production.yml`, `backup-and-restore.yml`
- `.github/scripts/publish-ops-backup.sh`

Do not invent a second restore path. Do not `--force-reset` or cancel upcoming bookings. Do not commit plaintext `.env` or `data.db`.

## Current procedures

**Backup:** VPS encrypts SQLite + `.env` with `BACKUP_ENCRYPTION_KEY`, then pushes to private `panagiod/meti-studio-ops`. Actions → **Backup Production**, nightly cron, and post-deploy.

**Verify (no live swap):** Actions → **Verify Restore** (`latest`). Decrypts and checks tables. Site stays up.

**Same VPS restore:** Actions → **Restore Production** → `latest` + type `RESTORE`. Or `CONFIRM=RESTORE ./deploy/restore-from-ops.sh latest`. Stops the app, saves `pre-restore-*.db`, replaces `data.db`, drops WAL/SHM, starts, checks `/api/health`, rolls back if health fails.

**Dress rehearsal:** Actions → **Backup and Restore** → type `RESTORE`.

**New VPS:** Actions → **Rebuild Production** → `REBUILD`. Untested on a real empty machine. Needs `BACKUP_ENCRYPTION_KEY` plus an unrestricted recovery SSH key.
