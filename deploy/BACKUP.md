# Studio backups

MeTi Pilates stores the schedule, blocked dates, and customer bookings in one SQLite file:

`/var/lib/meti-booking/data.db`

The public repo must not keep those files in plaintext. Encrypted copies go to the **private** ops repo.

**Setup and disaster recovery:** [OPS.md](./OPS.md)

## What runs automatically

1. **On the VPS, every night at 02:00 UTC** (05:00 Nicosia in summer)  
   `deploy/backup-studio-data.sh` writes:
   - encrypted files in `/var/lib/meti-booking/backups/`
   - last 7 raw copies on the server only
2. **GitHub Actions, every night and after each deploy**  
   Pulls the encrypted database and `.env` over the restricted deploy SSH key and commits them to `panagiod/meti-studio-ops`.

## Restore the live database (same VPS)

GitHub → **Actions → Restore Production** → backup `latest` → confirm `RESTORE`

Or on the server:

```bash
cd ~/meti-booking
CONFIRM=RESTORE ./deploy/restore-from-ops.sh latest
```

The restore script decrypts with `BACKUP_ENCRYPTION_KEY`, saves the current database first, then replaces `data.db`.

## If the server is gone

Use **Actions → Rebuild Production** on a new VPS, or run `CONFIRM=REBUILD ./deploy/bootstrap-from-ops.sh latest`. Full steps are in [OPS.md](./OPS.md).

Store `BACKUP_ENCRYPTION_KEY` in a password manager and as the GitHub secret of the same name.

## Manual backup

```bash
cd ~/meti-booking
./deploy/backup-studio-data.sh
```

Or run **Actions → Backup Production → Run workflow**.
