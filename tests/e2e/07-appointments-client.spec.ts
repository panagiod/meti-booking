import { test, expect } from "@playwright/test";
import { newApi, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createStudioInstructor, createClient } from "../helpers/fixtures";

test.describe("07 · Client appointments", () => {
  test("client lists their appointments with advisor and service details", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createStudioInstructor(request);
    const client = await createClient(request);
    const other = await createClient(request);

    const apt = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });
    // Appointment for ANOTHER client (must not appear in client's list)
    await prisma.appointment.create({
      data: {
        clientId: other.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });

    const res = await withSession(api, client.sessionToken).get("/api/client/appointments");
    expect(res.status()).toBe(200);
    const { appointments } = await res.json();
    expect(appointments.length).toBe(1);
    expect(appointments[0].id).toBe(apt.id);
    expect(appointments[0].instructor.user.name).toBeTruthy();
    expect(appointments[0].service.name).toBe("E2E Consulting");
  });

  test("appointment detail: participants only (403 for outsiders)", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createStudioInstructor(request);
    const client = await createClient(request);
    const intruder = await createClient(request);

    const apt = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        instructorEarning: 10000,
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

  test("review: only COMPLETED appointments and only the client", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createStudioInstructor(request);
    const client = await createClient(request);

    const completed = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "COMPLETED",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });

    // Review completed appointment as client
    const review = await withSession(api, client.sessionToken).post(
      `/api/appointments/${completed.id}/review`,
      { rating: 5, comment: "Excellent E2E advisory" }
    );
    expect(review.status(), await review.text()).toBe(201);
    const { review: createdReview } = await review.json();
    expect(createdReview.rating).toBe(5);

    // Advisor CANNOT review
    const advisorReview = await withSession(api, fixture.sessionToken).post(
      `/api/appointments/${completed.id}/review`,
      { rating: 1 }
    );
    expect(advisorReview.status()).toBe(403);

    // Update existing review
    const updateReview = await withSession(api, client.sessionToken).post(
      `/api/appointments/${completed.id}/review`,
      { rating: 4, comment: "Updated" }
    );
    expect(updateReview.status()).toBe(200);
    expect((await updateReview.json()).updated).toBe(true);

    // Review PENDING appointment → 400
    const pending = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "PENDING",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });
    const invalidReview = await withSession(api, client.sessionToken).post(
      `/api/appointments/${pending.id}/review`,
      { rating: 5 }
    );
    expect(invalidReview.status()).toBe(400);
  });

  test("chat: only participants can access and post", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createStudioInstructor(request);
    const client = await createClient(request);
    const intruder = await createClient(request);

    const apt = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });

    // Client posts message
    const postMsg = await withSession(api, client.sessionToken).post(
      `/api/appointments/${apt.id}/chat`,
      { body: "Hello, ready for the advisory?" }
    );
    expect(postMsg.status(), await postMsg.text()).toBe(201);

    // History visible to client
    const history = await withSession(api, client.sessionToken).get(`/api/appointments/${apt.id}/chat`);
    expect(history.status()).toBe(200);
    const { messages } = await history.json();
    expect(messages.length).toBe(1);
    expect(messages[0].body).toBe("Hello, ready for the advisory?");
    expect(messages[0].senderRole).toBe("client");

    // Intruder cannot view chat
    const intruderHistory = await withSession(api, intruder.sessionToken).get(
      `/api/appointments/${apt.id}/chat`
    );
    expect(intruderHistory.status()).toBe(403);
  });

  test("client can cancel a confirmed upcoming booking and free the slot", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createStudioInstructor(request);
    const client = await createClient(request);

    const apt = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });

    const cancel = await withSession(api, client.sessionToken).patch(`/api/appointments/${apt.id}`, {
      reason: "Cancelled by client",
    });
    expect(cancel.status(), await cancel.text()).toBe(200);

    const updated = await prisma.appointment.findUnique({ where: { id: apt.id } });
    expect(updated?.status).toBe("CANCELLED");
    expect(updated?.cancelledAt).toBeTruthy();

    const list = await withSession(api, client.sessionToken).get("/api/client/appointments");
    const { appointments } = await list.json();
    expect(appointments.some((item: { id: string }) => item.id === apt.id)).toBe(false);
  });

  test("client cannot cancel a confirmed booking inside the lead window", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createStudioInstructor(request);
    const client = await createClient(request);

    const apt = await prisma.appointment.create({
      data: {
        clientId: client.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });

    const cancel = await withSession(api, client.sessionToken).patch(`/api/appointments/${apt.id}`, {
      reason: "Too late",
    });
    expect(cancel.status()).toBe(400);
  });
});
