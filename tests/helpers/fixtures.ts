import { APIRequestContext, expect } from "@playwright/test";
import { prisma } from "./db";
import { MP_TEST_PUBLIC_KEY, MP_TEST_ACCESS_TOKEN } from "./mp";
import { BASE_URL, extractSessionToken } from "./api";
import { randomUUID } from "crypto";

// Fecha futura formateada como ISO local (para scheduledAt y slots)
export function futureDate(daysAhead: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// Fecha local YYYY-MM-DD (sin el sesgo UTC de toISOString)
export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Registro real vía better-auth → session token firmado y válido.
// El rol se ajusta después con prisma (getSession siempre lee el user actual).
export async function signupUser(
  api: APIRequestContext,
  name: string
): Promise<{ userId: string; email: string; sessionToken: string }> {
  const email = `e2e.${randomUUID().slice(0, 8)}@meti.test`;
  const password = "e2e-password-123";
  const headers = { Origin: BASE_URL };

  const signUp = await api.post(`${BASE_URL}/api/auth/sign-up/email`, {
    headers,
    data: { email, password, name },
  });
  expect(signUp.status(), `sign-up falló: ${await signUp.text()}`).toBe(200);
  const data = await signUp.json();

  const signIn = await api.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers,
    data: { email, password },
  });
  expect(signIn.status(), `sign-in falló: ${await signIn.text()}`).toBe(200);
  const sessionToken = await extractSessionToken(signIn);
  expect(sessionToken).toBeTruthy();

  return { userId: data.user.id, email, sessionToken: sessionToken! };
}

export interface AdvisorFixture {
  advisorId: string;
  userId: string;
  sessionToken: string;
  serviceId: string;
}

// Asesor activo con horario completo, categoría Legal y un servicio de 60 min
export async function createActiveAdvisor(
  api: APIRequestContext,
  opts?: {
    hidden?: boolean;
    withMP?: boolean;
    mpMode?: "TEST" | "PRODUCTION";
  }
): Promise<AdvisorFixture> {
  const { userId, sessionToken } = await signupUser(api, "E2E Asesor");

  // Convertir en asesor y dejarlo aprobado (equivalente al flujo real)
  await prisma.user.update({ where: { id: userId }, data: { role: "ADVISOR" } });
  await prisma.clientProfile.deleteMany({ where: { userId } });
  const advisor = await prisma.advisorProfile.create({
    data: {
      userId,
      isActive: true,
      isHidden: opts?.hidden || false,
      ...(opts?.withMP
        ? {
            mpPublicKey: MP_TEST_PUBLIC_KEY,
            mpAccessToken: MP_TEST_ACCESS_TOKEN,
            mpMode: opts?.mpMode || "PRODUCTION",
          }
        : {}),
    },
  });

  const category = await prisma.category.findUnique({ where: { slug: "legal" } });
  if (category) {
    await prisma.advisorCategory.create({
      data: { advisorId: advisor.id, categoryId: category.id },
    });
  }

  // Horario completo: lunes a domingo 08:00-18:00
  for (let dow = 0; dow <= 6; dow++) {
    await prisma.advisorSchedule.create({
      data: {
        advisorId: advisor.id,
        dayOfWeek: dow,
        startTime: "08:00",
        endTime: "18:00",
        gapMinutes: 15,
      },
    });
  }

  const service = await prisma.advisorService.create({
    data: {
      advisorId: advisor.id,
      name: "Consultoría E2E",
      description: "Servicio de prueba",
      durationMin: 60,
      priceCents: 10000,
    },
  });

  return {
    advisorId: advisor.id,
    userId,
    sessionToken,
    serviceId: service.id,
  };
}

export interface AdminFixture {
  userId: string;
  sessionToken: string;
}

export async function createAdmin(api: APIRequestContext): Promise<AdminFixture> {
  const { userId, sessionToken } = await signupUser(api, "E2E Admin");

  await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  await prisma.clientProfile.deleteMany({ where: { userId } });
  await prisma.adminProfile.create({ data: { userId, level: "GESTOR" } });

  return { userId, sessionToken };
}

export interface ClientFixture {
  userId: string;
  sessionToken: string;
  email: string;
}

export async function createClient(api: APIRequestContext): Promise<ClientFixture> {
  const { userId, sessionToken, email } = await signupUser(api, "E2E Cliente");
  return { userId, sessionToken, email };
}

export function asClient(api: APIRequestContext, token: string) {
  return {
    get: (url: string) =>
      api.get(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${token}` },
      }),
    post: (url: string, body?: unknown) =>
      api.post(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${token}` },
        data: body,
      }),
    put: (url: string, body?: unknown) =>
      api.put(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${token}` },
        data: body,
      }),
    del: (url: string) =>
      api.delete(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${token}` },
      }),
  };
}
