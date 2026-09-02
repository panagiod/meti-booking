import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { isSqliteDatabase } from "@/lib/database-provider";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@/generated/prisma/client");

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL!;
  if (isSqliteDatabase()) {
    const adapter = new PrismaBetterSqlite3({ url });
    return new PrismaClient({ adapter });
  }
  const adapter = new PrismaPg({
    connectionString: url,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
