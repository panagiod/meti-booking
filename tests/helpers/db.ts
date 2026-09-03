import { config } from "dotenv";
import { resolve } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "crypto";

config({ path: resolve(__dirname, "../../.env.test") });

// The generated Prisma client is ESM; Playwright's loader transpiles to CJS.
// tsx registers a require-hook that allows loading it without import.meta errors.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { register } = require("tsx/cjs/api");
register();

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../../src/generated/prisma/client");

export const TEST_DB_URL = process.env.TEST_DATABASE_URL!;

const adapter = new PrismaPg({ connectionString: TEST_DB_URL });

export const prisma = new PrismaClient({ adapter });

export const E2E_EMAIL_PREFIX = "e2e.";

export function testEmail(role: string): string {
  return `${E2E_EMAIL_PREFIX}${role}.${randomUUID().slice(0, 8)}@meti.test`;
}

export interface TestUser {
  id: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "CLIENT";
}

// Creates a user directly in the DB (without going through the sign-up API)
export async function createUserDirect(
  role: "ADMIN" | "INSTRUCTOR" | "CLIENT",
  email?: string
): Promise<TestUser> {
  const user = await prisma.user.create({
    data: {
      email: email || testEmail(role.toLowerCase()),
      name: `E2E ${role}`,
      role,
    },
  });

  if (role === "ADMIN") {
    await prisma.adminProfile.create({ data: { userId: user.id, level: "GESTOR" } });
  } else if (role === "INSTRUCTOR") {
    await prisma.instructorProfile.create({
      data: { userId: user.id, isActive: true },
    });
  } else {
    await prisma.clientProfile.create({ data: { userId: user.id } });
  }

  return { id: user.id, email: user.email, role };
}

// Creates a valid better-auth session for a user (inserted directly into the
// sessions table, which is what auth.api.getSession queries).
export async function createSession(userId: string): Promise<string> {
  const token = `e2e-${randomUUID()}`;
  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return token;
}

export function sessionCookie(token: string): string {
  return `better-auth.session_token=${token}`;
}

// Registry of emails created during the run (for defensive cleanup)
export const createdEmails: string[] = [];

export function trackEmail(email: string) {
  createdEmails.push(email);
}

// SAFE CLEANUP: only deletes e2e.* user data
// NEVER touches other users or unrelated records.
export async function cleanupE2EData() {
  const e2eUsers = await prisma.user.findMany({
    where: { email: { startsWith: E2E_EMAIL_PREFIX } },
    select: { id: true, email: true },
  });

  if (e2eUsers.length === 0) {
    console.log("  [cleanup] No e2e users to clean up");
    return 0;
  }

  const userIds = e2eUsers.map((u: { id: string }) => u.id);

  // Advisor profiles linked to e2e users
  const advisorProfiles = await prisma.instructorProfile.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const advisorIds = advisorProfiles.map((p: { id: string }) => p.id);

  if (advisorIds.length > 0) {
    // Appointments where the advisor or client is e2e
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          { instructorId: { in: advisorIds } },
          { clientId: { in: userIds } },
        ],
      },
    });
    await prisma.promotion.deleteMany({ where: { instructorId: { in: advisorIds } } });
    await prisma.instructorService.deleteMany({ where: { instructorId: { in: advisorIds } } });
    await prisma.instructorSchedule.deleteMany({ where: { instructorId: { in: advisorIds } } });
    await prisma.instructorDocument.deleteMany({ where: { instructorId: { in: advisorIds } } });
    await prisma.blockedTime.deleteMany({ where: { instructorId: { in: advisorIds } } });
    await prisma.invoice.deleteMany({ where: { instructorId: { in: advisorIds } } });
    await prisma.instructorCategory.deleteMany({ where: { instructorId: { in: advisorIds } } });
  }

  await prisma.appointment.deleteMany({ where: { clientId: { in: userIds } } });

  await prisma.adminProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.clientProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.instructorProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.verification.deleteMany({ where: { identifier: { in: e2eUsers.map((u: { email: string }) => u.email) } } });

  const deleted = await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  console.log(`  [cleanup] E2e users removed: ${deleted.count}`);
  return deleted.count;
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
