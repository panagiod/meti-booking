import { test, expect } from "@playwright/test";
import { newApi, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createActiveAdvisor, createClient, futureDate } from "../helpers/fixtures";
import {
  E2E_SKIP_MP_CHECKOUT,
  MP_CHECKOUT_UNAVAILABLE,
  paySandboxCheckout,
} from "../helpers/mp";

async function waitForStatus(appointmentId: string, status: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const apt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (apt?.status === status) return apt;
    await new Promise((r) => setTimeout(r, 2_000));
  }
  throw new Error(`Appointment ${appointmentId} nunca llegó a ${status}`);
}

test.describe("06 · Flujo de compra con Mercado Pago sandbox", () => {
  test("preferencia sandbox: initPoint válido y cita PENDING con isTest", async ({ request }) => {
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
    const { appointment, initPoint, preferenceId } = await res.json();

    expect(initPoint).toContain("mercadopago.com");
    expect(initPoint).toContain("/checkout/v1/redirect");
    expect(preferenceId).toBeTruthy();
    expect(appointment.status).toBe("PENDING");
    expect(appointment.isTest).toBe(true);

    // El precio incluye el fee de categoría Legal (15%)
    expect(appointment.totalCents).toBe(11500);
    expect(appointment.platformFee).toBe(1500);
    expect(appointment.advisorEarning).toBe(10000);
  });

  test("compra completa en sandbox: pago con tarjeta de prueba → cita CONFIRMED", async ({ request, page }) => {
    test.skip(E2E_SKIP_MP_CHECKOUT, "E2E_SKIP_MP_CHECKOUT=1");

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
    const { appointment, initPoint, preferenceId } = await res.json();

    // Sesión del cliente en el navegador (para que /checkout/result pueda
    // consultar la cita tras el redirect de MP)
    await page.context().addCookies([
      {
        name: "better-auth.session_token",
        value: client.sessionToken,
        url: BASE_URL,
      },
    ]);

    const paymentId = await paySandboxCheckout(page, initPoint, client.email).catch(
      (e: Error) => {
        if (e.message === MP_CHECKOUT_UNAVAILABLE) {
          test.skip(
            true,
            "El checkout sandbox del vendedor de prueba no carga (cuenta de prueba de MP rota). La preferencia y el resto del flujo ya están validados."
          );
        }
        throw e;
      }
    );
    expect(paymentId, "MP sandbox no devolvió payment_id").toBeTruthy();

    // La cita debe confirmarse (result page verifica contra la API sandbox)
    const confirmed = await waitForStatus(appointment.id, "CONFIRMED");
    expect(confirmed.paymentId).toBe(paymentId);

    // El webhook (notificación sintética con el payment real) confirma idempotente
    const webhook = await api.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: {
        type: "payment",
        data: { id: paymentId },
        preferred_id: preferenceId,
      },
    });
    expect(webhook.status()).toBe(200);
    expect((await webhook.json()).ok).toBe(true);

    // Verificación directa: ya confirmada → alreadyConfirmed
    const verify = await withSession(api, client.sessionToken).post(
      `/api/appointments/${appointment.id}/verify`,
      { paymentId }
    );
    expect(verify.status()).toBe(200);
    const verifyData = await verify.json();
    expect(verifyData.alreadyConfirmed || verifyData.confirmed).toBe(true);
  });

  test("webhook: paths de error e idempotencia sin pago real", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request, { withMP: true, mpMode: "TEST" });
    const client = await createClient(request);

    const res = await withSession(api, client.sessionToken).post("/api/appointments", {
      advisorId: fixture.advisorId,
      serviceId: fixture.serviceId,
      scheduledAt: futureDate(5, 9, 0),
      discountCents: 0,
    });
    expect(res.status(), await res.text()).toBe(201);
    const { appointment, preferenceId } = await res.json();

    // Cita desconocida → 404
    const unknown = await api.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: {
        type: "payment",
        data: { id: "99999999" },
        preferred_id: "pref-inexistente",
      },
    });
    expect(unknown.status()).toBe(404);

    // Sin paymentId (solo preference) → 400
    const noPayment = await api.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: {
        type: "payment",
        preferred_id: preferenceId,
      },
    });
    expect(noPayment.status()).toBe(400);

    // Topic que no manejamos → 200 ignorado
    const ignored = await api.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: { type: "chargeback" },
    });
    expect(ignored.status()).toBe(200);
    expect((await ignored.json()).ignored).toBe("chargeback");

    // GET del webhook responde ok (healthcheck de MP)
    const health = await api.get(`${BASE_URL}/api/webhooks/mercadopago`);
    expect(health.status()).toBe(200);
  });

  test("verify con paymentId falso no confirma la cita", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request, { withMP: true, mpMode: "TEST" });
    const client = await createClient(request);

    const res = await withSession(api, client.sessionToken).post("/api/appointments", {
      advisorId: fixture.advisorId,
      serviceId: fixture.serviceId,
      scheduledAt: futureDate(5, 14, 0),
      discountCents: 0,
    });
    const { appointment } = await res.json();

    const verify = await withSession(api, client.sessionToken).post(
      `/api/appointments/${appointment.id}/verify`,
      { paymentId: "0000000000" }
    );
    // getPayment con id inválido puede devolver 404/404 en MP → la app responde
    // ok:false o 500/502 según el error; lo importante: la cita NO se confirma
    const after = await prisma.appointment.findUnique({ where: { id: appointment.id } });
    expect(after?.status).toBe("PENDING");
    expect(after?.paymentId).toBeNull();
    void verify;
  });

  test("compra sin credenciales MP del asesor → 400 con mensaje claro", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request); // sin MP
    const client = await createClient(request);

    const res = await withSession(api, client.sessionToken).post("/api/appointments", {
      advisorId: fixture.advisorId,
      serviceId: fixture.serviceId,
      scheduledAt: futureDate(3, 10, 0),
      discountCents: 0,
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Mercado Pago");
  });
});
