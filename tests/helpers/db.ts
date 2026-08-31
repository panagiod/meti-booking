import { config } from "dotenv";
import { resolve } from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "crypto";

config({ path: resolve(__dirname, "../../.env.test") });

// El cliente Prisma generado es ESM; el loader de Playwright transpila a CJS.
// tsx registra un require-hook que permite cargarlo sin errores de import.meta.
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
  role: "ADMIN" | "ADVISOR" | "CLIENT";
}

// Crea un usuario directamente en la DB (sin pasar por la API de sign-up)
export async function createUserDirect(
  role: "ADMIN" | "ADVISOR" | "CLIENT",
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
  } else if (role === "ADVISOR") {
    await prisma.advisorProfile.create({
      data: { userId: user.id, isActive: true },
    });
  } else {
    await prisma.clientProfile.create({ data: { userId: user.id } });
  }

  return { id: user.id, email: user.email, role };
}

// Crea una sesión de better-auth válida para un usuario (se inserta directo en
// la tabla sessions, que es lo que auth.api.getSession consulta).
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

// Registro de emails creados durante el run (para limpieza defensiva)
export const createdEmails: string[] = [];

export function trackEmail(email: string) {
  createdEmails.push(email);
}

// ============================================================
// CLEANUP SEGURO: solo borra datos de usuarios e2e.*
// NUNCA toca otros usuarios ni registros ajenos.
// ============================================================
export async function cleanupE2EData() {
  const e2eUsers = await prisma.user.findMany({
    where: { email: { startsWith: E2E_EMAIL_PREFIX } },
    select: { id: true, email: true },
  });

  if (e2eUsers.length === 0) {
    console.log("  [cleanup] No hay usuarios e2e que limpiar");
    return 0;
  }

  const userIds = e2eUsers.map((u: { id: string }) => u.id);

  // Advisor profiles ligados a usuarios e2e
  const advisorProfiles = await prisma.advisorProfile.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const advisorIds = advisorProfiles.map((p: { id: string }) => p.id);

  if (advisorIds.length > 0) {
    // Citas donde el asesor o el cliente es e2e
    await prisma.appointment.deleteMany({
      where: {
        OR: [
          { advisorId: { in: advisorIds } },
          { clientId: { in: userIds } },
        ],
      },
    });
    await prisma.promotion.deleteMany({ where: { advisorId: { in: advisorIds } } });
    await prisma.advisorService.deleteMany({ where: { advisorId: { in: advisorIds } } });
    await prisma.advisorSchedule.deleteMany({ where: { advisorId: { in: advisorIds } } });
    await prisma.advisorDocument.deleteMany({ where: { advisorId: { in: advisorIds } } });
    await prisma.blockedTime.deleteMany({ where: { advisorId: { in: advisorIds } } });
    await prisma.invoice.deleteMany({ where: { advisorId: { in: advisorIds } } });
    await prisma.advisorCategory.deleteMany({ where: { advisorId: { in: advisorIds } } });
  }

  await prisma.appointment.deleteMany({ where: { clientId: { in: userIds } } });

  await prisma.adminProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.clientProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.advisorProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.account.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.verification.deleteMany({ where: { identifier: { in: e2eUsers.map((u: { email: string }) => u.email) } } });

  const deleted = await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  console.log(`  [cleanup] Usuarios e2e eliminados: ${deleted.count}`);
  return deleted.count;
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
