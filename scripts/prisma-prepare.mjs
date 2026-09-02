/**
 * Detect DB provider from DATABASE_URL and write .prisma/schema.build.prisma
 * so we can use SQLite on small VPS (lite) and PostgreSQL elsewhere.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "prisma/schema.prisma");
const outDir = resolve(root, ".prisma");
const outSchema = resolve(outDir, "schema.build.prisma");

function detectProvider() {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  if (url.startsWith("file:")) return "sqlite";
  return "postgresql";
}

const provider = detectProvider();
let schema = readFileSync(source, "utf8");
schema = schema.replace(/provider\s*=\s*"(postgresql|sqlite)"/, `provider = "${provider}"`);

if (provider === "sqlite") {
  // @db.Text is PostgreSQL-only; SQLite uses TEXT for String by default.
  schema = schema.replace(/\s+@db\.Text/g, "");
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outSchema, schema);

console.log(`prisma-prepare: provider=${provider} → ${outSchema}`);
