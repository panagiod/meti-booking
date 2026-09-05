import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function bash(script: string) {
  return execFileSync("bash", ["-lc", script], { encoding: "utf8", cwd: ROOT });
}

describe("ops backup stream", () => {
  it("extracts encrypted db, env, and inventory markers", () => {
    const dir = mkdtempSync(join(tmpdir(), "meti-ops-stream-"));
    try {
      writeFileSync(
        join(dir, "stream.txt"),
        [
          "METI_BACKUP_DAY=2026-09-05",
          "METI_BACKUP_FINGERPRINT=abc123",
          "METI_BACKUP_BEGIN",
          Buffer.from("database-bytes").toString("base64"),
          "METI_BACKUP_END",
          "METI_ENV_BEGIN",
          Buffer.from("env-bytes").toString("base64"),
          "METI_ENV_END",
          "METI_INVENTORY_BEGIN",
          "domain=meti-pilates.com",
          "METI_INVENTORY_END",
          "",
        ].join("\n")
      );

      const parsed = bash(`
        STREAM="${join(dir, "stream.txt")}"
        awk '/^METI_BACKUP_BEGIN$/{p=1;next} /^METI_BACKUP_END$/{p=0} p' "$STREAM" | base64 -d
        echo ---
        awk '/^METI_ENV_BEGIN$/{p=1;next} /^METI_ENV_END$/{p=0} p' "$STREAM" | base64 -d
        echo ---
        awk '/^METI_INVENTORY_BEGIN$/{p=1;next} /^METI_INVENTORY_END$/{p=0} p' "$STREAM"
      `);

      expect(parsed).toContain("database-bytes");
      expect(parsed).toContain("env-bytes");
      expect(parsed).toContain("domain=meti-pilates.com");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("inventory script never prints secret values", () => {
    const output = bash(`
      BACKUP_ENCRYPTION_KEY=super-secret-should-not-appear \
      GOOGLE_CLIENT_SECRET=another-secret-value \
      ./deploy/write-ops-inventory.sh
    `);
    expect(output).toMatch(/public_repo=panagiod\/meti-booking/);
    expect(output).toMatch(/domain=/);
    expect(output).not.toContain("super-secret-should-not-appear");
    expect(output).not.toContain("another-secret-value");
    expect(output).not.toMatch(/^GOOGLE_CLIENT_SECRET=/m);
    expect(output).not.toMatch(/^BACKUP_ENCRYPTION_KEY=/m);
  });

  it("publish and setup scripts do not enable shell trace", () => {
    const publish = bash("grep -n 'set -x' .github/scripts/publish-ops-backup.sh || true");
    const setup = bash("grep -n 'set -x' deploy/setup-ops-repo.sh || true");
    expect(publish.trim()).toBe("");
    expect(setup.trim()).toBe("");
  });
});
