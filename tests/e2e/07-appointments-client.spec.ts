import { test, expect } from "@playwright/test";
import { newApi, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createActiveAdvisor, createClient } from "../helpers/fixtures";

test.describe("07 · Citas del cliente", () => {
  test("cliente lista sus citas con detalle de asesor y servicio", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const client = await createClient(request);
    const other = await createClient(request);

    const apt = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        advisorEarning: 10000,
        platformFee: 1500,
      },
    });
    // Cita de OTRO cliente (no debe aparecer en la lista del cliente)
    await prisma.appointment.create({
      data: {
        clientId: other.userId,
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        advisorEarning: 10000,
        platformFee: 1500,
      },
    });

    const res = await withSession(api, client.sessionToken).get("/api/client/appointments");
    expect(res.status()).toBe(200);
    const { appointments } = await res.json();
    expect(appointments.length).toBe(1);
    expect(appointments[0].id).toBe(apt.id);
    expect(appointments[0].advisor.user.name).toBeTruthy();
    expect(appointments[0].service.name).toBe("Consultoría E2E");
  });

  test("detalle de cita: solo participantes (403 para ajenos)", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const client = await createClient(request);
    const intruder = await createClient(request);

    const apt = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        advisorEarning: 10000,
        platformFee: 1500,
      },
    });

    const ok = await withSession(api, client.sessionToken).get(`/api/appointments/${apt.id}`);
    expect(ok.status()).toBe(200);

    const advisorOk = await withSession(api, fixture.sessionToken).get(`/api/appointments/${apt.id}`);
    expect(advisorOk.status()).toBe(200);

    const forbidden = await withSession(api, intruder.sessionToken).get(`/api/appointments/${apt.id}`);
    expect(forbidden.status()).toBe(403);
  });

  test("reseña: solo citas COMPLETED y solo el cliente", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const client = await createClient(request);

    const completed = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "COMPLETED",
        totalCents: 11500,
        advisorEarning: 10000,
        platformFee: 1500,
      },
    });

    // Reseñar cita completada como cliente
    const review = await withSession(api, client.sessionToken).post(
      `/api/appointments/${completed.id}/review`,
      { rating: 5, comment: "Excelente asesoría E2E" }
    );
    expect(review.status(), await review.text()).toBe(201);
    const { review: createdReview } = await review.json();
    expect(createdReview.rating).toBe(5);

    // El asesor NO puede reseñar
    const advisorReview = await withSession(api, fixture.sessionToken).post(
      `/api/appointments/${completed.id}/review`,
      { rating: 1 }
    );
    expect(advisorReview.status()).toBe(403);

    // Actualizar reseña existente
    const updateReview = await withSession(api, client.sessionToken).post(
      `/api/appointments/${completed.id}/review`,
      { rating: 4, comment: "Actualizada" }
    );
    expect(updateReview.status()).toBe(200);
    expect((await updateReview.json()).updated).toBe(true);

    // Reseñar cita PENDING → 400
    const pending = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "PENDING",
        totalCents: 11500,
        advisorEarning: 10000,
        platformFee: 1500,
      },
    });
    const invalidReview = await withSession(api, client.sessionToken).post(
      `/api/appointments/${pending.id}/review`,
      { rating: 5 }
    );
    expect(invalidReview.status()).toBe(400);
  });

  test("chat: solo participantes acceden y pueden postear", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const client = await createClient(request);
    const intruder = await createClient(request);

    const apt = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        advisorEarning: 10000,
        platformFee: 1500,
      },
    });

    // Cliente postea mensaje
    const postMsg = await withSession(api, client.sessionToken).post(
      `/api/appointments/${apt.id}/chat`,
      { body: "Hola, ¿listo para la asesoría?" }
    );
    expect(postMsg.status(), await postMsg.text()).toBe(201);

    // Historial visible para el cliente
    const history = await withSession(api, client.sessionToken).get(`/api/appointments/${apt.id}/chat`);
    expect(history.status()).toBe(200);
    const { messages } = await history.json();
    expect(messages.length).toBe(1);
    expect(messages[0].body).toBe("Hola, ¿listo para la asesoría?");
    expect(messages[0].senderRole).toBe("client");

    // Intruso no puede ver el chat
    const intruderHistory = await withSession(api, intruder.sessionToken).get(
      `/api/appointments/${apt.id}/chat`
    );
    expect(intruderHistory.status()).toBe(403);
  });
});
