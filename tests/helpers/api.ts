import { APIRequestContext, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import { trackEmail } from "./db";

export const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3100";

export function newApi(request: APIRequestContext) {
  return request;
}

export function withSession(api: APIRequestContext, sessionToken: string) {
  return {
    get: (url: string) =>
      api.get(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${sessionToken}` },
      }),
    post: (url: string, body?: unknown) =>
      api.post(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${sessionToken}` },
        data: body,
      }),
    put: (url: string, body?: unknown) =>
      api.put(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${sessionToken}` },
        data: body,
      }),
    patch: (url: string, body?: unknown) =>
      api.patch(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${sessionToken}` },
        data: body,
      }),
    del: (url: string) =>
      api.delete(`${BASE_URL}${url}`, {
        headers: { cookie: `better-auth.session_token=${sessionToken}` },
      }),
  };
}

export interface SignupResult {
  userId: string;
  email: string;
  sessionToken: string;
}

// Real sign-up via the better-auth API (validates the app's auth flow)
export async function signupClient(
  api: APIRequestContext
): Promise<SignupResult> {
  const email = `e2e.client.${randomUUID().slice(0, 8)}@meti.test`;
  trackEmail(email);

  const authHeaders = { Origin: BASE_URL };

  const res = await api.post(`${BASE_URL}/api/auth/sign-up/email`, {
    headers: authHeaders,
    data: {
      email,
      password: "e2e-password-123",
      name: "E2E Client",
    },
  });
  expect(res.status(), `sign-up failed: ${await res.text()}`).toBe(200);

  const data = await res.json();
  expect(data.user?.id).toBeTruthy();

  const signIn = await api.post(`${BASE_URL}/api/auth/sign-in/email`, {
    headers: authHeaders,
    data: { email, password: "e2e-password-123" },
  });
  expect(signIn.status(), `sign-in failed: ${await signIn.text()}`).toBe(200);

  const sessionToken = await extractSessionToken(signIn);
  expect(sessionToken).toBeTruthy();

  return { userId: data.user.id, email, sessionToken: sessionToken! };
}

// Extracts the session cookie from the sign-in Set-Cookie response
export async function extractSessionToken(
  res: Awaited<ReturnType<APIRequestContext["post"]>>
): Promise<string | null> {
  const setCookie = res.headers()["set-cookie"];
  if (!setCookie) return null;
  const match = setCookie.match(/better-auth\.session_token=([^;,]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
