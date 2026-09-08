import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function runPrune(env: Record<string, string>, extraArgs: string[] = []) {
  return execFileSync("bash", [join(ROOT, "deploy/prune-disk.sh"), ...extraArgs], {
    encoding: "utf8",
    cwd: ROOT,
    env: {
      ...process.env,
      METI_PRUNE_SKIP_SYSTEM: "1",
      METI_DISK_PERCENT: "40",
      ...env,
    },
  });
}

function touchNamed(dir: string, names: string[]) {
  mkdirSync(dir, { recursive: true });
  names.forEach((name, index) => {
    const path = join(dir, name);
    writeFileSync(path, `file-${index}`);
    const atime = new Date(Date.now() - (names.length - index) * 60_000);
    utimesSync(path, atime, atime);
  });
}

describe("prune-disk", () => {
  it("keeps a bounded set of local backups and caps log files", () => {
    const dir = mkdtempSync(join(tmpdir(), "meti-prune-"));
    try {
      const backups = join(dir, "backups");
      const logs = join(dir, "logs");
      const repoBackups = join(dir, "repo-backups");
      mkdirSync(logs, { recursive: true });
      mkdirSync(repoBackups, { recursive: true });

      touchNamed(
        backups,
        Array.from({ length: 12 }, (_, i) => `sqlite-2026010${String(i + 1).padStart(2, "0")}-000000.db`)
      );
      touchNamed(
        backups,
        Array.from({ length: 35 }, (_, i) => `sqlite-202601${String(i + 1).padStart(2, "0")}-000000.db.enc`)
      );
      touchNamed(
        backups,
        Array.from({ length: 6 }, (_, i) => `pre-restore-2026010${i + 1}-000000.db`)
      );
      writeFileSync(join(logs, "monitor.log"), "x".repeat(5000));

      runPrune({
        METI_DATA_DIR: dir,
        METI_LOG_DIR: logs,
        METI_REPO_BACKUP_DIR: repoBackups,
        METI_LOG_MAX_BYTES: "1000",
      });

      const remaining = readdirSync(backups);
      expect(remaining.filter((name) => name.startsWith("sqlite-") && name.endsWith(".db")).length).toBe(7);
      expect(remaining.filter((name) => name.endsWith(".db.enc")).length).toBe(30);
      expect(remaining.filter((name) => name.startsWith("pre-restore-")).length).toBe(3);
      expect(readFileSync(join(logs, "monitor.log")).length).toBe(1000);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("keeps fewer copies when disk is already high", () => {
    const dir = mkdtempSync(join(tmpdir(), "meti-prune-urgent-"));
    try {
      const backups = join(dir, "backups");
      const logs = join(dir, "logs");
      mkdirSync(logs, { recursive: true });
      touchNamed(
        backups,
        Array.from({ length: 10 }, (_, i) => `sqlite-2026020${String(i + 1).padStart(2, "0")}-000000.db`)
      );
      touchNamed(
        backups,
        Array.from({ length: 12 }, (_, i) => `sqlite-202602${String(i + 1).padStart(2, "0")}-000000.db.enc`)
      );

      runPrune({
        METI_DATA_DIR: dir,
        METI_LOG_DIR: logs,
        METI_REPO_BACKUP_DIR: join(dir, "repo"),
        METI_DISK_PERCENT: "93",
      });

      const remaining = readdirSync(backups);
      expect(remaining.filter((name) => name.startsWith("sqlite-") && name.endsWith(".db")).length).toBe(1);
      expect(remaining.filter((name) => name.endsWith(".db.enc")).length).toBe(3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
