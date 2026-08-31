import { test, expect } from "@playwright/test";
import { newApi, signupClient, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createAdmin } from "../helpers/fixtures";

test.describe("02 · Advisor onboarding and admin approval", () => {
  test("client requests to become advisor → inactive profile → cannot create services", async ({ request }) => {
    const api = newApi(request);
    const { userId, sessionToken } = await signupClient(api);

    const res = await withSession(api, sessionToken).post("/api/client/become-advisor");
    expect(res.status(), await res.text()).toBe(200);
    expect((await res.json()).success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user!.role).toBe("ADVISOR");

    const advisor = await prisma.advisorProfile.findUnique({ where: { userId } });
    expect(advisor).toBeTruthy();
    expect(advisor!.isActive).toBe(false);

    // Inactive: creating a service must fail with 403
    const createService = await withSession(api, sessionToken).post("/api/advisor/services", {
      name: "Service not allowed",
      durationMin: 60,
      priceCents: 10000,
    });
    expect(createService.status()).toBe(403);
  });

  test("admin approves advisor → becomes active and can create services; then suspend", async ({ request }) => {
    const api = newApi(request);
    const { userId, sessionToken } = await signupClient(api);
    await withSession(api, sessionToken).post("/api/client/become-advisor");

    const advisor = await prisma.advisorProfile.findUnique({ where: { userId } });
    expect(advisor).toBeTruthy();

    const admin = await createAdmin(request);
    const adminApi = withSession(api, admin.sessionToken);

    // Approve
    const approve = await adminApi.post(`/api/admin/advisors/${advisor!.id}`, { action: "approve" });
    expect(approve.status(), await approve.text()).toBe(200);
    expect((await approve.json()).isActive).toBe(true);

    // Now can create a service
    const createService = await withSession(api, sessionToken).post("/api/advisor/services", {
      name: "Approved consulting",
      durationMin: 60,
      priceCents: 10000,
    });
    expect(createService.status(), await createService.text()).toBe(201);

    // Suspend
    const suspend = await adminApi.post(`/api/admin/advisors/${advisor!.id}`, { action: "suspend" });
    expect(suspend.status(), await suspend.text()).toBe(200);
    expect((await suspend.json()).isActive).toBe(false);

    const after = await prisma.advisorProfile.findUnique({ where: { id: advisor!.id } });
    expect(after!.isActive).toBe(false);
  });

  test("invalid action on admin advisors → 400", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);
    const { userId } = await (async () => {
      const { userId: uid, sessionToken } = await signupClient(api);
      await withSession(api, sessionToken).post("/api/client/become-advisor");
      return { userId: uid };
    })();
    const advisor = await prisma.advisorProfile.findUnique({ where: { userId } });

    const res = await withSession(api, admin.sessionToken).post(
      `/api/admin/advisors/${advisor!.id}`,
      { action: "destroy" }
    );
    expect(res.status()).toBe(400);
  });

  test("client without advisor profile cannot access advisor endpoints", async ({ request }) => {
    const api = newApi(request);
    const { sessionToken } = await signupClient(api);

    const res = await withSession(api, sessionToken).get("/api/advisor/services");
    expect(res.status()).toBe(404);
  });
});
