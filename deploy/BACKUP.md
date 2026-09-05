# Studio backups

MeTi Pilates stores the schedule, blocked dates, and customer bookings in one SQLite file:

`/var/lib/meti-booking/data.db`

This repo is public, so backups copied to GitHub are **encrypted**.

## What runs automatically

1. **On the VPS, every night at 02:00 UTC** (05:00 Nicosia in summer)  
   `deploy/backup-studio-data.sh` writes:
   - encrypted files in `/var/lib/meti-booking/backups/`
   - last 7 raw copies on the server only
2. **GitHub Actions, every night and after each deploy**  
   Pulls the encrypted file over the restricted deploy SSH key and commits it to the `backups` branch.

## Restore the website schedule and customers

On the production server:

```bash
cd ~/meti-booking
git fetch origin backups
git show origin/backups:backups/latest.db.enc > /tmp/meti-restore.db.enc
CONFIRM=RESTORE ./deploy/restore-studio-data.sh /tmp/meti-restore.db.enc
```

To restore a specific day, use `backups/YYYY-MM-DD.db.enc` instead of `latest.db.enc`.

The restore script:

- decrypts with `BACKUP_ENCRYPTION_KEY`
- saves the current database first
- stops `meti-booking`, replaces `data.db`, starts the app again

## If the server is gone

1. Recreate the VPS and deploy from `main`.
2. Copy `BACKUP_ENCRYPTION_KEY` into `.env`.
3. Download `backups/latest.db.enc` from the GitHub `backups` branch.
4. Run `CONFIRM=RESTORE ./deploy/restore-studio-data.sh /path/to/latest.db.enc`.

Store `BACKUP_ENCRYPTION_KEY` in a password manager. The GitHub files are useless without it.

## Manual backup

```bash
cd ~/meti-booking
./deploy/backup-studio-data.sh
```

Or run **Actions → Backup Production → Run workflow**.
