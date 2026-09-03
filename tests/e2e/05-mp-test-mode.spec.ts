import { test, expect } from "@playwright/test";
import { newApi, withSession, BASE_URL } from "../helpers/api";
import { createStudioInstructor, createClient, futureDate } from "../helpers/fixtures";

test.describe("05 · Mercado Pago Test/Production mode", () => {
  test("appointment created in TEST mode is marked isTest", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createStudioInstructor(request, { withMP: true, mpMode: "TEST" });
    const client = await createClient(request);

    const res = await withSession(api, client.sessionToken).post("/api/appointments", {
      instructorId: fixture.instructorId,
      serviceId: fixture.serviceId,
      scheduledAt: futureDate(3, 10, 0),
    });
    expect(res.status(), await res.text()).toBe(201);
    const { appointment } = await res.json();
    expect(appointment.isTest).toBe(true);
  });

  test("appointment created in PRODUCTION mode is NOT marked isTest", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createStudioInstructor(request, { withMP: true, mpMode: "PRODUCTION" });
    const client = await createClient(request);

    const res = await withSession(api, client.sessionToken).post("/api/appointments", {
      instructorId: fixture.instructorId,
      serviceId: fixture.serviceId,
      scheduledAt: futureDate(3, 15, 0),
    });
    expect(res.status(), await res.text()).toBe(201);
    const { appointment } = await res.json();
    expect(appointment.isTest).toBe(false);
  });

  test("studio API exposes instructor payment mode", async ({ request }) => {
    const api = newApi(request);
    await createStudioInstructor(request, { withMP: true, mpMode: "TEST" });

    const res = await api.get(`${BASE_URL}/api/studio`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.studio.instructorId).toBeTruthy();
    expect(["TEST", "PRODUCTION", null]).toContain(data.studio.mpMode);
  });
});
