import { test, expect } from "@playwright/test";
import { newApi, signupClient, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createAdmin, createStudioInstructor } from "../helpers/fixtures";

test.describe("08 · Admin panel", () => {
  test("initial setup: first admin only when no admins exist", async ({ request }) => {
    const api = newApi(request);

    const hasAdmins = await api.get(`${BASE_URL}/api/admin/setup`);
    expect(hasAdmins.status()).toBe(200);
    const { hasAdmins: exists } = await hasAdmins.json();

    // Test DB is fresh: this test validates the bootstrap flow.
    // If a previous e2e admin remains, skip (flow already validated).
    test.skip(exists, "admins already exist in the test database");

    const { userId, sessionToken } = await signupClient(api);

    const setup = await withSession(api, sessionToken).post("/api/admin/setup", {
      userId,
    });
    expect(setup.status(), await setup.text()).toBe(200);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.role).toBe("ADMIN");
    const profile = await prisma.adminProfile.findUnique({ where: { userId } });
    expect(profile).toBeTruthy();

    // Second attempt → 400 (admin already exists)
    const second = await withSession(api, sessionToken).post("/api/admin/setup", {
      userId,
    });
    expect(second.status()).toBe(400);
  });

  test("dashboard: stats and 403 for non-admin", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);
    await createStudioInstructor(request);

    const res = await withSession(api, admin.sessionToken).get("/api/admin/dashboard");
    expect(res.status(), await res.text()).toBe(200);
    const data = await res.json();
    expect(data.stats.totalUsers).toBeGreaterThanOrEqual(1);

    const client = await signupClient(api);
    const forbidden = await withSession(api, client.sessionToken).get("/api/admin/dashboard");
    expect(forbidden.status()).toBe(403);
  });

  test("list users by role", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);

    const res = await withSession(api, admin.sessionToken).get("/api/admin/users?role=ADMIN");
    expect(res.status()).toBe(200);
    const { users } = await res.json();
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users.every((u: any) => u.role === "admin")).toBe(true);
  });

  test("invoices: generate and list", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);
    const fixture = await createStudioInstructor(request);

    // Billable appointment for the current month
    await prisma.appointment.create({
      data: {
        clientId: admin.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(),
        durationMin: 60,
        status: "COMPLETED",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });

    const generate = await withSession(api, admin.sessionToken).post("/api/admin/invoices/generate", {
      month: new Date().toISOString().slice(0, 7),
    });
    expect(generate.status(), await generate.text()).toBe(200);
    const gen = await generate.json();
    expect(gen.ok).toBe(true);

    const list = await withSession(api, admin.sessionToken).get("/api/admin/invoices");
    expect(list.status()).toBe(200);
    const { invoices } = await list.json();
    expect(invoices.length).toBeGreaterThanOrEqual(1);
  });

  test("categories: create and list", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);

    const created = await withSession(api, admin.sessionToken).post("/api/admin/categories", {
      name: `E2E Category ${Date.now()}`,
      slug: `e2e-cat-${Date.now()}`,
      description: "Test category",
      minimumPriceCents: 10000,
      feePercentage: 10,
    });
    expect(created.status(), await created.text()).toBe(201);

    const list = await withSession(api, admin.sessionToken).get("/api/admin/categories");
    expect(list.status()).toBe(200);
    expect((await list.json()).categories.length).toBeGreaterThanOrEqual(11);
  });
});
