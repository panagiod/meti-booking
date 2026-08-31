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
  throw new Error(`Appointment ${appointmentId} never reached ${status}`);
}

test.describe("06 · Mercado Pago sandbox purchase flow", () => {
  test("sandbox preference: valid initPoint and PENDING appointment with isTest", async ({ request }) => {
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

    // Price includes Legal category fee (15%)
    expect(appointment.totalCents).toBe(11500);
    expect(appointment.platformFee).toBe(1500);
    expect(appointment.advisorEarning).toBe(10000);
  });

  test("full sandbox purchase: test card payment → CONFIRMED appointment", async ({ request, page }) => {
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

    // Client session in the browser (so /checkout/result can
    // query the appointment after MP redirect)
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
            "The seller's sandbox checkout does not load (broken MP test account). The preference and rest of the flow are already validated."
          );
        }
        throw e;
      }
    );
    expect(paymentId, "MP sandbox did not return payment_id").toBeTruthy();

    // Appointment must be confirmed (result page verifies against sandbox API)
    const confirmed = await waitForStatus(appointment.id, "CONFIRMED");
    expect(confirmed.paymentId).toBe(paymentId);

    // Webhook (synthetic notification with real payment) confirms idempotently
    const webhook = await api.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: {
        type: "payment",
        data: { id: paymentId },
        preferred_id: preferenceId,
      },
    });
    expect(webhook.status()).toBe(200);
    expect((await webhook.json()).ok).toBe(true);

    // Direct verification: already confirmed → alreadyConfirmed
    const verify = await withSession(api, client.sessionToken).post(
      `/api/appointments/${appointment.id}/verify`,
      { paymentId }
    );
    expect(verify.status()).toBe(200);
    const verifyData = await verify.json();
    expect(verifyData.alreadyConfirmed || verifyData.confirmed).toBe(true);
  });

  test("webhook: error paths and idempotency without real payment", async ({ request }) => {
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

    // Unknown appointment → 404
    const unknown = await api.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: {
        type: "payment",
        data: { id: "99999999" },
        preferred_id: "pref-inexistente",
      },
    });
    expect(unknown.status()).toBe(404);

    // Without paymentId (preference only) → 400
    const noPayment = await api.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: {
        type: "payment",
        preferred_id: preferenceId,
      },
    });
    expect(noPayment.status()).toBe(400);

    // Topic we don't handle → 200 ignored
    const ignored = await api.post(`${BASE_URL}/api/webhooks/mercadopago`, {
      data: { type: "chargeback" },
    });
    expect(ignored.status()).toBe(200);
    expect((await ignored.json()).ignored).toBe("chargeback");

    // GET on webhook responds ok (MP healthcheck)
    const health = await api.get(`${BASE_URL}/api/webhooks/mercadopago`);
    expect(health.status()).toBe(200);
  });

  test("verify with fake paymentId does not confirm the appointment", async ({ request }) => {
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
    // getPayment with invalid id may return 404 on MP → app responds
    // ok:false or 500/502 depending on error; important: appointment is NOT confirmed
    const after = await prisma.appointment.findUnique({ where: { id: appointment.id } });
    expect(after?.status).toBe("PENDING");
    expect(after?.paymentId).toBeNull();
    void verify;
  });

  test("purchase without advisor MP credentials → 400 with clear message", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request); // no MP
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
