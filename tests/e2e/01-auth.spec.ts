import { test, expect } from "@playwright/test";
import { newApi, signupClient, withSession, BASE_URL } from "../helpers/api";
import { prisma, trackEmail } from "../helpers/db";
import { randomUUID } from "crypto";

test.describe("01 · Auth", () => {
  test("sign-up creates CLIENT user with ClientProfile (better-auth hook)", async ({ request }) => {
    const api = newApi(request);
    const { userId } = await signupClient(api);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });
    expect(user).toBeTruthy();
    expect(user!.role).toBe("CLIENT");
    expect(user!.client).toBeTruthy();
  });

  test("sign-in with wrong password returns error", async ({ request }) => {
    const api = newApi(request);
    const email = `e2e.badpass.${randomUUID().slice(0, 8)}@meti.test`;
    trackEmail(email);

    const headers = { Origin: BASE_URL };

    const signUp = await api.post(`${BASE_URL}/api/auth/sign-up/email`, {
      headers,
      data: { email, password: "e2e-password-123", name: "E2E BadPass" },
    });
    expect(signUp.status()).toBe(200);

    const signIn = await api.post(`${BASE_URL}/api/auth/sign-in/email`, {
      headers,
      data: { email, password: "wrong-password" },
    });
    expect(signIn.status()).toBeGreaterThanOrEqual(400);
  });

  test("protected endpoint without session returns 401", async ({ request }) => {
    const api = newApi(request);
    const res = await api.get(`${BASE_URL}/api/client/appointments`);
    expect(res.status()).toBe(401);
  });

  test("client session accesses its endpoints and gets 403 on admin endpoints", async ({ request }) => {
    const api = newApi(request);
    const { sessionToken } = await signupClient(api);

    const appointments = await withSession(api, sessionToken).get("/api/client/appointments");
    expect(appointments.status()).toBe(200);
    expect((await appointments.json()).appointments).toEqual([]);

    const adminDash = await withSession(api, sessionToken).get("/api/admin/dashboard");
    expect(adminDash.status()).toBe(403);
  });
});
