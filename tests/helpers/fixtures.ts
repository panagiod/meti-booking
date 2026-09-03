import { APIRequestContext, expect } from "@playwright/test";
import { prisma } from "./db";
import { MP_TEST_PUBLIC_KEY, MP_TEST_ACCESS_TOKEN } from "./mp";
import { BASE_URL, extractSessionToken } from "./api";
import { randomUUID } from "crypto";
import { encryptMpAccessToken } from "@/lib/instructor-mp";

// Future date formatted as local ISO (for scheduledAt and slots)
export function futureDate(daysAhead: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

// Local date YYYY-MM-DD (without UTC bias from toISOString)
export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Real sign-up via better-auth → signed, valid session token.
// Role is adjusted afterward with prisma (getSession always reads the current user).
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
  expect(signUp.status(), `sign-up failed: ${await signUp.text()}`).toBe(200);
  const data = await signUp.json();

  const signIn = await api.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers,
    data: { email, password },
  });
  expect(signIn.status(), `sign-in failed: ${await signIn.text()}`).toBe(200);
  const sessionToken = await extractSessionToken(signIn);
  expect(sessionToken).toBeTruthy();

  return { userId: data.user.id, email, sessionToken: sessionToken! };
}

export interface InstructorFixture {
  instructorId: string;
  userId: string;
  sessionToken: string;
  serviceId: string;
}

// Active advisor with full schedule, Legal category, and a 60-min service
export async function createStudioInstructor(
  api: APIRequestContext,
  opts?: {
    hidden?: boolean;
    withMP?: boolean;
    mpMode?: "TEST" | "PRODUCTION";
  }
): Promise<InstructorFixture> {
  const { userId, sessionToken } = await signupUser(api, "E2E Advisor");

  // Convert to advisor and mark as approved (equivalent to the real flow)
  await prisma.user.update({ where: { id: userId }, data: { role: "INSTRUCTOR" } });
  await prisma.clientProfile.deleteMany({ where: { userId } });
  const advisor = await prisma.instructorProfile.create({
    data: {
      userId,
      isActive: true,
      isVerified: true,
      isHidden: opts?.hidden || false,
      ...(opts?.withMP
        ? {
            mpPublicKey: MP_TEST_PUBLIC_KEY,
            mpAccessToken: encryptMpAccessToken(MP_TEST_ACCESS_TOKEN),
            mpMode: opts?.mpMode || "PRODUCTION",
          }
        : {}),
    },
  });

  const category = await prisma.category.findUnique({ where: { slug: "legal" } });
  if (category) {
    await prisma.instructorCategory.create({
      data: { instructorId: advisor.id, categoryId: category.id },
    });
  }

  // Full schedule: Monday through Sunday 08:00-18:00
  for (let dow = 0; dow <= 6; dow++) {
    await prisma.instructorSchedule.create({
      data: {
        instructorId: advisor.id,
        dayOfWeek: dow,
        startTime: "08:00",
        endTime: "18:00",
        gapMinutes: 15,
      },
    });
  }

  const service = await prisma.instructorService.create({
    data: {
      instructorId: advisor.id,
      name: "E2E Consulting",
      description: "Test service",
      durationMin: 60,
      priceCents: 10000,
    },
  });

  return {
    instructorId: advisor.id,
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
  const { userId, sessionToken, email } = await signupUser(api, "E2E Client");
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
