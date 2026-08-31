import { test, expect } from "@playwright/test";
import { newApi, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createActiveAdvisor, futureDate } from "../helpers/fixtures";

test.describe("04 · Advisor management", () => {
  test("services: create, list, update (PUT with id), deactivate, and delete", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const advisor = withSession(api, fixture.sessionToken);

    // Create
    const created = await advisor.post("/api/advisor/services", {
      name: "Strategic consulting",
      description: "Consulting session.",
      durationMin: 60,
      priceCents: 10000,
      rescheduleHoursMin: 24,
    });
    expect(created.status(), await created.text()).toBe(201);
    const service = (await created.json()).service;
    expect(service.name).toBe("Strategic consulting");

    // List
    const list = await advisor.get("/api/advisor/services");
    expect(list.status()).toBe(200);
    const { services } = await list.json();
    expect(services.length).toBeGreaterThanOrEqual(2);
    expect(services.some((s: any) => s.id === service.id)).toBe(true);

    // Update with id (regression: id was missing and returned 400)
    const updated = await advisor.put("/api/advisor/services", {
      id: service.id,
      name: "Strategic consulting v2",
      durationMin: 90,
      priceCents: 15000,
    });
    expect(updated.status(), await updated.text()).toBe(200);
    expect((await updated.json()).service.name).toBe("Strategic consulting v2");

    // PUT without id → 400
    const noId = await advisor.put("/api/advisor/services", { name: "no id" });
    expect(noId.status()).toBe(400);

    // Zod validation: duration less than 15 → 400
    const invalid = await advisor.post("/api/advisor/services", {
      name: "Invalid",
      durationMin: 5,
      priceCents: 10000,
    });
    expect(invalid.status()).toBe(400);

    // Deactivate toggle
    const toggle = await advisor.put("/api/advisor/services", {
      id: service.id,
      isActive: false,
    });
    expect(toggle.status()).toBe(200);
    expect((await toggle.json()).service.isActive).toBe(false);

    // Delete
    const del = await advisor.del(`/api/advisor/services?id=${service.id}`);
    expect(del.status(), await del.text()).toBe(200);

    const dbService = await prisma.advisorService.findUnique({ where: { id: service.id } });
    expect(dbService).toBeNull();
  });

  test("profile: bio, bookingLeadHours, and isHidden toggle", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const advisor = withSession(api, fixture.sessionToken);

    const category = await prisma.category.findUnique({ where: { slug: "legal" } });

    const update = await advisor.put("/api/advisor/profile", {
      bio: "E2E test bio",
      bookingLeadHours: 6,
      categoryIds: [category!.id],
    });
    expect(update.status(), await update.text()).toBe(200);

    // Hide: must not erase bio or other fields (partial PUT regression)
    const hide = await advisor.put("/api/advisor/profile", { isHidden: true });
    expect(hide.status()).toBe(200);

    const get = await advisor.get("/api/advisor/profile");
    expect(get.status()).toBe(200);
    const { profile } = await get.json();
    expect(profile.isHidden).toBe(true);
    expect(profile.bio).toBe("E2E test bio");
    expect(profile.categories.length).toBe(1);

    // bookingLeadHours is not in GET: verify in DB
    const dbProfile = await prisma.advisorProfile.findUnique({
      where: { id: fixture.advisorId },
    });
    expect(dbProfile?.bookingLeadHours).toBe(6);

    // Hidden: does not appear in public listing
    const publicList = await api.get(`${BASE_URL}/api/services`);
    const { advisors } = await publicList.json();
    expect(advisors.some((a: any) => a.id === fixture.advisorId)).toBe(false);

    // Show again
    const show = await advisor.put("/api/advisor/profile", { isHidden: false });
    expect(show.status()).toBe(200);
  });

  test("schedule: save and retrieve", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const advisor = withSession(api, fixture.sessionToken);

    const schedule = Array.from({ length: 7 }, (_, dow) => ({
      dayOfWeek: dow,
      isActive: dow !== 0, // Sunday off
      startTime: "09:00",
      endTime: "17:00",
      lunchStart: "12:00",
      lunchEnd: "13:00",
      gapMinutes: 15,
    }));

    const put = await advisor.put("/api/advisor/schedule", { schedules: schedule });
    expect(put.status(), await put.text()).toBe(200);

    const get = await advisor.get("/api/advisor/schedule");
    expect(get.status()).toBe(200);
    const { schedules } = await get.json();
    // PUT only persists active days (Sunday was excluded)
    expect(schedules.length).toBe(6);
    const monday = schedules.find((s: any) => s.dayOfWeek === 1);
    expect(monday.startTime).toBe("09:00");
    expect(monday.lunchStart).toBe("12:00");
  });

  test("blocked times: create, list, and delete", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const advisor = withSession(api, fixture.sessionToken);

    const start = new Date();
    start.setDate(start.getDate() + 30);
    const end = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);

    const created = await advisor.post("/api/advisor/blocked-times", {
      title: "E2E Vacation",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isAllDay: true,
    });
    expect(created.status(), await created.text()).toBe(201);
    const { blockedTime } = await created.json();

    const list = await advisor.get("/api/advisor/blocked-times");
    expect(list.status()).toBe(200);
    expect((await list.json()).blockedTimes.some((b: any) => b.id === blockedTime.id)).toBe(true);

    const del = await advisor.del(`/api/advisor/blocked-times?id=${blockedTime.id}`);
    expect(del.status(), await del.text()).toBe(200);
    expect(
      await prisma.blockedTime.findUnique({ where: { id: blockedTime.id } })
    ).toBeNull();
  });

  test("promotions: create with discount and query by service", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const advisor = withSession(api, fixture.sessionToken);

    const start = new Date();
    start.setDate(start.getDate() - 1);
    const end = new Date();
    end.setDate(end.getDate() + 7);

    const created = await advisor.post("/api/advisor/promotions", {
      serviceId: fixture.serviceId,
      name: "E2E Promo 20%",
      discountType: "percentage",
      discountValue: 20,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });
    expect(created.status(), await created.text()).toBe(201);

    // Public query for active promotion
    const pub = await api.get(`${BASE_URL}/api/promotions?serviceId=${fixture.serviceId}`);
    expect(pub.status()).toBe(200);
    const { promotion } = await pub.json();
    expect(promotion).toBeTruthy();
    expect(promotion.discountValue).toBe(20);

    // End date <= start date → 400
    const invalid = await advisor.post("/api/advisor/promotions", {
      serviceId: fixture.serviceId,
      name: "Invalid",
      discountType: "percentage",
      discountValue: 20,
      startAt: end.toISOString(),
      endAt: start.toISOString(),
    });
    expect(invalid.status()).toBe(400);
  });
});
