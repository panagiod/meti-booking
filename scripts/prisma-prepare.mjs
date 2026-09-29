/**
 * Write .prisma/schema.build.prisma for SQLite (production + local demo).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "prisma/schema.prisma");
const outDir = resolve(root, ".prisma");
const outSchema = resolve(outDir, "schema.build.prisma");

let schema = readFileSync(source, "utf8");
schema = schema.replace(/provider\s*=\s*"(postgresql|sqlite)"/, 'provider = "sqlite"');
schema = schema.replace(/\s+@db\.Text/g, "");

mkdirSync(outDir, { recursive: true });
writeFileSync(outSchema, schema);

console.log(`prisma-prepare: provider=sqlite → ${outSchema}`);
