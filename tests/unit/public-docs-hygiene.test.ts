import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

function listMarkdown(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const full = join(dir, name);
    const rel = relative(ROOT, full);
    if (rel.startsWith("deploy/ops-repo/docs/")) continue;
    if (statSync(full).isDirectory()) {
      listMarkdown(full, out);
      continue;
    }
    if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

describe("public docs hygiene", () => {
  const files = listMarkdown(ROOT);
  const leaked = [
    /2\.29\.22\.46/,
    /panagiod\/meti-studio-ops/,
    /ssh root@\d/,
  ];

  it("does not publish the production host or private ops repo name", () => {
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const pattern of leaked) {
        if (pattern.test(text)) {
          hits.push(`${relative(ROOT, file)} matches ${pattern}`);
        }
      }
    }
    expect(hits).toEqual([]);
  });
});
