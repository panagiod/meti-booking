import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { assertSqliteDatabaseUrl } from "@/lib/database-provider";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@/generated/prisma/client");

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createPrismaClient() {
  assertSqliteDatabaseUrl();
  const url = process.env.DATABASE_URL!;
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
