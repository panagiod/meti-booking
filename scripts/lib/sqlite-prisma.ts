import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../../src/generated/prisma/client");

export function createSqlitePrisma(databaseUrl: string) {
  const url = databaseUrl.trim();
  if (!url.startsWith("file:")) {
    throw new Error(`Expected SQLite DATABASE_URL (file:…), got: ${url.slice(0, 32)}…`);
  }
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}
