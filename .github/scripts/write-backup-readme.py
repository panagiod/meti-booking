from pathlib import Path
import sys

day = sys.argv[1]
fingerprint = sys.argv[2]
Path("backups").mkdir(exist_ok=True)
Path("backups/README.md").write_text(
    "# MeTi Pilates encrypted backups\n\n"
    "These files restore the live SQLite database (schedule, blocked days, and customer bookings).\n"
    "The GitHub repo is public, so every file is encrypted.\n\n"
    "Restore on the server:\n\n"
    "```bash\n"
    "cd ~/meti-booking\n"
    "git fetch origin backups\n"
    f"git show origin/backups:backups/{day}.db.enc > /tmp/meti-restore.db.enc\n"
    "CONFIRM=RESTORE ./deploy/restore-studio-data.sh /tmp/meti-restore.db.enc\n"
    "```\n\n"
    "The decrypt key is `BACKUP_ENCRYPTION_KEY` in the server `.env`.\n"
    f"Fingerprint: `{fingerprint}`\n"
)
