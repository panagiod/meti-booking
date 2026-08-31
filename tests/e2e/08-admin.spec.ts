import { test, expect } from "@playwright/test";
import { newApi, signupClient, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createAdmin, createActiveAdvisor } from "../helpers/fixtures";

test.describe("08 · Panel de administración", () => {
  test("setup inicial: primer admin solo si no hay admins", async ({ request }) => {
    const api = newApi(request);

    const hasAdmins = await api.get(`${BASE_URL}/api/admin/setup`);
    expect(hasAdmins.status()).toBe(200);
    const { hasAdmins: exists } = await hasAdmins.json();

    // La DB de pruebas es nueva: este test valida el flujo de bootstrap.
    // Si un admin e2e previo quedó, se salta (el flujo ya fue validado).
    test.skip(exists, "ya hay admins en la DB de pruebas");

    const { userId } = await signupClient(api);

    const setup = await api.post(`${BASE_URL}/api/admin/setup`, { data: { userId } });
    expect(setup.status(), await setup.text()).toBe(200);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.role).toBe("ADMIN");
    const profile = await prisma.adminProfile.findUnique({ where: { userId } });
    expect(profile).toBeTruthy();

    // Segundo intento → 400 (ya existe admin)
    const second = await api.post(`${BASE_URL}/api/admin/setup`, { data: { userId } });
    expect(second.status()).toBe(400);
  });

  test("dashboard: stats y 403 para no-admin", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);
    await createActiveAdvisor(request);

    const res = await withSession(api, admin.sessionToken).get("/api/admin/dashboard");
    expect(res.status(), await res.text()).toBe(200);
    const data = await res.json();
    expect(data.stats.activeAdvisors).toBeGreaterThanOrEqual(1);

    const client = await signupClient(api);
    const forbidden = await withSession(api, client.sessionToken).get("/api/admin/dashboard");
    expect(forbidden.status()).toBe(403);
  });

  test("listar asesores y filtrar por estado", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);
    const active = await createActiveAdvisor(request);
    await prisma.advisorProfile.update({
      where: { id: active.advisorId },
      data: { isActive: true },
    });

    const all = await withSession(api, admin.sessionToken).get("/api/admin/advisors");
    expect(all.status()).toBe(200);
    const { advisors } = await all.json();
    expect(advisors.some((a: any) => a.id === active.advisorId)).toBe(true);

    const pending = await withSession(api, admin.sessionToken).get("/api/admin/advisors?status=pending");
    expect(pending.status()).toBe(200);
  });

  test("listar usuarios por rol", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);

    const res = await withSession(api, admin.sessionToken).get("/api/admin/users?role=ADMIN");
    expect(res.status()).toBe(200);
    const { users } = await res.json();
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users.every((u: any) => u.role === "admin")).toBe(true);
  });

  test("facturas: generar y listar", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);
    const fixture = await createActiveAdvisor(request);

    // Cita facturable del mes actual
    await prisma.appointment.create({
      data: {
        clientId: admin.userId,
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(),
        durationMin: 60,
        status: "COMPLETED",
        totalCents: 11500,
        advisorEarning: 10000,
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

  test("categorías: crear y listar", async ({ request }) => {
    const api = newApi(request);
    const admin = await createAdmin(request);

    const created = await withSession(api, admin.sessionToken).post("/api/admin/categories", {
      name: `E2E Categoría ${Date.now()}`,
      slug: `e2e-cat-${Date.now()}`,
      description: "Categoría de prueba",
      minimumPriceCents: 10000,
      feePercentage: 10,
    });
    expect(created.status(), await created.text()).toBe(201);

    const list = await withSession(api, admin.sessionToken).get("/api/admin/categories");
    expect(list.status()).toBe(200);
    expect((await list.json()).categories.length).toBeGreaterThanOrEqual(11);
  });
});
