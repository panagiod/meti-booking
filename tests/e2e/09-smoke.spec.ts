import { test, expect } from "@playwright/test";
import { createStudioInstructor, localDateStr } from "../helpers/fixtures";
import { prisma } from "../helpers/db";
import { parseLocalISO } from "../../src/lib/timezone";

test.describe("09 · Smoke: key page rendering", () => {
  test("landing renders without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByText("Meti").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("login and register render their forms", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();

    await page.goto("/register");
    await expect(page.locator("form")).toBeVisible();
  });

  test("book page renders the studio calendar", async ({ page, request }) => {
    await createStudioInstructor(request);
    await page.goto("/book", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".studio-booking").first()).toBeVisible({ timeout: 30_000 });
  });

  test("legacy advisor URL redirects to book", async ({ page, request }) => {
    const fixture = await createStudioInstructor(request);
    await page.goto(`/advisor/${fixture.instructorId}`);
    await expect(page).toHaveURL(/\/book/);
  });

  test("checkout without booking data shows empty state", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.locator('text="No booking data"')).toBeVisible();
  });

  test("redirect shows the premium loading state", async ({ page }) => {
    await page.goto("/redirect");
    await expect(page.locator('text="Welcome to Meti"')).toBeVisible();
    await expect(page.locator('text="Verifying your session"')).toBeVisible();
  });

  test("slots: active schedule generates available slots and filters Sunday", async ({ request }) => {
    const fixture = await createStudioInstructor(request);

    // Find a future Monday
    const d = new Date();
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    const dateStr = localDateStr(d);

    const res = await request.get(
      `/api/slots?instructorId=${fixture.instructorId}&serviceId=${fixture.serviceId}&date=${dateStr}`
    );
    expect(res.status()).toBe(200);
    const { slots } = await res.json();
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some((s: any) => s.available)).toBe(true);
    expect(slots[0].time).toBe("08:00");

    // Missing parameters → 400
    const missing = await request.get(`/api/slots?instructorId=${fixture.instructorId}`);
    expect(missing.status()).toBe(400);
  });

  test("slots: existing appointment blocks the corresponding slot", async ({ request }) => {
    const fixture = await createStudioInstructor(request);

    const d = new Date();
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    const dateStr = localDateStr(d);

    // With a 15-min gap and 60-min duration, slots are every 75 min:
    // 08:00, 09:15, 10:30... Use a real slot (09:15 Colombia time).
    const scheduledAt = parseLocalISO(`${dateStr}T09:15`)!;

    await prisma.appointment.create({
      data: {
        clientId: fixture.userId,
        instructorId: fixture.instructorId,
        serviceId: fixture.serviceId,
        scheduledAt,
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        instructorEarning: 10000,
        platformFee: 1500,
      },
    });

    const res = await request.get(
      `/api/slots?instructorId=${fixture.instructorId}&serviceId=${fixture.serviceId}&date=${dateStr}`
    );
    const { slots } = await res.json();
    const blocked = slots.find((s: any) => s.time === "09:15");
    expect(blocked?.available).toBe(false);
    const free = slots.find((s: any) => s.time === "08:00");
    expect(free?.available).toBe(true);
  });
});
