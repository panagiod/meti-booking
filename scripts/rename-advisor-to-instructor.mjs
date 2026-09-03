#!/usr/bin/env node
/**
 * SQLite: rename leftover advisor_* tables/columns to instructor_*
 * and UserRole ADVISOR -> INSTRUCTOR.
 *
 * No-op on PostgreSQL or when the database is already renamed.
 * If prisma db push created empty instructor_* tables beside advisor_*,
 * drop the empty instructor_* tables first, then rename.
 */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function sqlitePath() {
  const url = (process.env.DATABASE_URL || "").trim();
  if (!url.startsWith("file:")) return null;
  let pathPart = url.slice("file:".length);
  if (pathPart.startsWith("///")) pathPart = pathPart.slice(2);
  const query = pathPart.indexOf("?");
  if (query >= 0) pathPart = pathPart.slice(0, query);
  if (pathPart.startsWith("/")) return pathPart;
  return resolve(root, pathPart);
}

const dbPath = sqlitePath();
if (!dbPath) {
  console.log("[rename] skip (not sqlite)");
  process.exit(0);
}
if (!existsSync(dbPath)) {
  console.log(`[rename] no sqlite at ${dbPath}`);
  process.exit(0);
}

const db = new Database(dbPath);

function tables() {
  return new Set(
    db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((row) => row.name),
  );
}

function columns(table) {
  return new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name));
}

function renameTable(from, to) {
  const names = tables();
  if (!names.has(from)) return;
  if (names.has(to)) {
    const toCount = db.prepare(`SELECT COUNT(*) AS n FROM "${to}"`).get().n;
    const fromCount = db.prepare(`SELECT COUNT(*) AS n FROM "${from}"`).get().n;
    if (toCount === 0) {
      db.exec(`DROP TABLE "${to}"`);
    } else if (fromCount === 0) {
      db.exec(`DROP TABLE "${from}"`);
      return;
    } else {
      throw new Error(`both ${from} and ${to} have rows; refusing to guess`);
    }
  }
  db.exec(`ALTER TABLE "${from}" RENAME TO "${to}"`);
  console.log(`[rename] table ${from} -> ${to}`);
}

function renameColumn(table, from, to) {
  if (!tables().has(table)) return;
  const cols = columns(table);
  if (!cols.has(from) || cols.has(to)) return;
  db.exec(`ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}"`);
  console.log(`[rename] ${table}.${from} -> ${to}`);
}

const existing = tables();
const needsRename = [...existing].some(
  (name) => name.startsWith("advisor_") || name === "verification_cases",
);

if (needsRename) {
  const backupPath = `${dbPath}.pre-instructor-rename`;
  if (!existsSync(backupPath)) {
    copyFileSync(dbPath, backupPath);
    console.log(`[rename] backup ${backupPath}`);
  }
}

db.pragma("foreign_keys = OFF");

const tx = db.transaction(() => {
  renameTable("advisor_profiles", "instructor_profiles");
  renameTable("advisor_services", "instructor_services");
  renameTable("advisor_schedules", "instructor_schedules");
  renameTable("advisor_documents", "instructor_documents");
  renameTable("advisor_categories", "instructor_categories");

  renameColumn("instructor_services", "advisorId", "instructorId");
  renameColumn("instructor_schedules", "advisorId", "instructorId");
  renameColumn("instructor_documents", "advisorId", "instructorId");
  renameColumn("instructor_categories", "advisorId", "instructorId");
  renameColumn("appointments", "advisorId", "instructorId");
  renameColumn("appointments", "advisorEarning", "instructorEarning");
  renameColumn("promotions", "advisorId", "instructorId");
  renameColumn("invoices", "advisorId", "instructorId");
  renameColumn("blocked_times", "advisorId", "instructorId");
  renameColumn("reviews", "advisorId", "instructorId");
  renameColumn("verification_cases", "advisorId", "instructorId");

  if (tables().has("users")) {
    const changed = db
      .prepare("UPDATE users SET role = 'INSTRUCTOR' WHERE role = 'ADVISOR'")
      .run().changes;
    if (changed) console.log(`[rename] ${changed} user role(s) ADVISOR -> INSTRUCTOR`);
  }
});

tx();
db.close();
console.log("[rename] sqlite instructor rename done");
