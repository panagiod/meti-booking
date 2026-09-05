import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT = join(ROOT, ".github/scripts/write-ssh-key.sh");

const BODY = "A".repeat(80)
const MULTILINE = [
  "-----BEGIN OPENSSH PRIVATE KEY-----",
  BODY.slice(0, 70),
  BODY.slice(70),
  "-----END OPENSSH PRIVATE KEY-----",
  "",
].join("\n");

describe("write-ssh-key", () => {
  it("turns a one-line GitHub secret into a PEM file", () => {
    const dir = mkdtempSync(join(tmpdir(), "meti-ssh-"));
    try {
      const dest = join(dir, "key");
      execFileSync("bash", [SCRIPT, dest], {
        env: { ...process.env, PRODUCTION_SSH_KEY: MULTILINE.replaceAll("\n", "\\n").trimEnd() },
      });
      expect(readFileSync(dest, "utf8")).toBe(MULTILINE);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
