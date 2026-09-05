import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function bash(script: string) {
  return execFileSync("bash", ["-lc", script], { encoding: "utf8", cwd: ROOT });
}

describe("studio backup crypto", () => {
  it("encrypts and decrypts a sqlite file", () => {
    const dir = mkdtempSync(join(tmpdir(), "meti-backup-"));
    try {
      const db = join(dir, "data.db");
      const enc = join(dir, "data.db.enc");
      const out = join(dir, "restored.db");
      execFileSync("sqlite3", [db, "CREATE TABLE studio (name TEXT); INSERT INTO studio VALUES ('MeTi');"]);
      const original = readFileSync(db);
      writeFileSync(join(dir, "key"), "test-backup-key-not-for-production");

      bash(`
        source "${ROOT}/deploy/backup-crypto.sh"
        meti_encrypt_file "${db}" "${enc}" "test-backup-key-not-for-production"
        meti_decrypt_file "${enc}" "${out}" "test-backup-key-not-for-production"
      `);

      expect(readFileSync(out).equals(original)).toBe(true);
      expect(
        execFileSync("sqlite3", [out, "SELECT name FROM studio;"], { encoding: "utf8" }).trim()
      ).toBe("MeTi");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
