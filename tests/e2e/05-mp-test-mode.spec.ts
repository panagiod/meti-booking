import { test, expect } from "@playwright/test";
import { newApi, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createActiveAdvisor, createClient, futureDate } from "../helpers/fixtures";
import { MP_TEST_PUBLIC_KEY, MP_TEST_ACCESS_TOKEN } from "../helpers/mp";

test.describe("05 · Modo Prueba/Producción de Mercado Pago", () => {
  test("guardar credenciales sandbox + modo TEST y validación de formato", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const advisor = withSession(api, fixture.sessionToken);

    // Credenciales inválidas → 400
    const invalid = await advisor.post("/api/advisor/mercadopago", {
      publicKey: "PK-invalido",
      accessToken: "TOKEN-invalido",
    });
    expect(invalid.status()).toBe(400);

    // Credenciales sandbox válidas
    const saved = await advisor.post("/api/advisor/mercadopago", {
      publicKey: MP_TEST_PUBLIC_KEY,
      accessToken: MP_TEST_ACCESS_TOKEN,
      mpMode: "TEST",
    });
    expect(saved.status(), await saved.text()).toBe(200);

    // GET refleja el modo y la conexión
    const get = await advisor.get("/api/advisor/mercadopago");
    expect(get.status()).toBe(200);
    const data = await get.json();
    expect(data.mpMode).toBe("TEST");
    expect(data.isConnected).toBe(true);
    expect(data.accessToken).toBe("••••••••••••••••");
  });

  test("cita creada en modo TEST queda marcada isTest", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request, { withMP: true, mpMode: "TEST" });
    const client = await createClient(request);

    const res = await withSession(api, client.sessionToken).post("/api/appointments", {
      advisorId: fixture.advisorId,
      serviceId: fixture.serviceId,
      scheduledAt: futureDate(3, 10, 0),
      discountCents: 0,
    });
    expect(res.status(), await res.text()).toBe(201);
    const { appointment } = await res.json();

    expect(appointment.isTest).toBe(true);
    expect(appointment.status).toBe("PENDING");

    const dbApt = await prisma.appointment.findUnique({ where: { id: appointment.id } });
    expect(dbApt?.isTest).toBe(true);
  });

  test("al pasar a PRODUCCIÓN se eliminan las citas de prueba", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request, { withMP: true, mpMode: "TEST" });
    const advisor = withSession(api, fixture.sessionToken);
    const client = await createClient(request);

    // Crea 2 citas de prueba
    for (const day of [3, 4]) {
      const res = await withSession(api, client.sessionToken).post("/api/appointments", {
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt: futureDate(day, 11, 0),
        discountCents: 0,
      });
      expect(res.status()).toBe(201);
    }

    const before = await prisma.appointment.count({
      where: { advisorId: fixture.advisorId, isTest: true },
    });
    expect(before).toBe(2);

    // Cambiar a PRODUCCIÓN → borra citas test
    const switchMode = await advisor.post("/api/advisor/mercadopago", {
      mpMode: "PRODUCTION",
    });
    expect(switchMode.status(), await switchMode.text()).toBe(200);
    const result = await switchMode.json();
    expect(result.mpMode).toBe("PRODUCTION");
    expect(result.deletedTestCount).toBe(2);

    const after = await prisma.appointment.count({
      where: { advisorId: fixture.advisorId, isTest: true },
    });
    expect(after).toBe(0);

    const dbAdvisor = await prisma.advisorProfile.findUnique({
      where: { id: fixture.advisorId },
    });
    expect(dbAdvisor?.mpMode).toBe("PRODUCTION");
  });

  test("cita creada en modo PRODUCCIÓN NO queda marcada isTest", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request, { withMP: true, mpMode: "PRODUCTION" });
    const client = await createClient(request);

    const res = await withSession(api, client.sessionToken).post("/api/appointments", {
      advisorId: fixture.advisorId,
      serviceId: fixture.serviceId,
      scheduledAt: futureDate(3, 15, 0),
      discountCents: 0,
    });
    expect(res.status(), await res.text()).toBe(201);
    const { appointment } = await res.json();
    expect(appointment.isTest).toBe(false);
  });

  test("mpMode inválido → 400", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);

    const res = await withSession(api, fixture.sessionToken).post("/api/advisor/mercadopago", {
      mpMode: "STAGING",
    });
    expect(res.status()).toBe(400);
  });

  test("checkout público ve el modo TEST del asesor", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request, { withMP: true, mpMode: "TEST" });

    const res = await api.get(`${BASE_URL}/api/advisors/${fixture.advisorId}/mercadopago`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.isConnected).toBe(true);
    expect(data.mpMode).toBe("TEST");
  });
});
