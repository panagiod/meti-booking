import { test, expect, type APIRequestContext } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL || "https://meti-pilates.com";
const ORIGIN = { Origin: BASE_URL };

function nextSaturday(): string {
  const d = new Date();
  const daysUntilSaturday = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function extractSessionToken(setCookie: string | undefined): string | null {
  if (!setCookie) return null;
  const match = setCookie.match(/(?:__Secure-)?better-auth\.session_token=([^;,]+)/);
  return match ? match[1] : null;
}

function sessionCookieHeader(token: string): { cookie: string } {
  return {
    cookie: `__Secure-better-auth.session_token=${token}; better-auth.session_token=${token}`,
  };
}

async function slotAt(request: APIRequestContext, advisorId: string, serviceId: string, date: string, time: string) {
  const res = await request.get(
    `${BASE_URL}/api/slots?advisorId=${advisorId}&serviceId=${serviceId}&date=${date}`
  );
  expect(res.status()).toBe(200);
  const { slots } = await res.json();
  return (slots as Array<{ time: string; booked: number; remaining: number; available: boolean }>).find(
    (slot) => slot.time === time
  );
}

test.describe("Production · public site and booking APIs", () => {
  test("homepage, book, login, and forgot-password render", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/");
    await expect(page.getByText("Meropi Tirri").first()).toBeVisible();

    await page.goto("/book");
    await expect(page.locator(".studio-booking, form, [class*='calendar']").first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/Meropi Tirri|Pick a date|Επιλέξτε|Book|Κλείστε/i).first()).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.getByRole("link", { name: /Forgot password|Ξεχάσατε/i })).toBeVisible();

    await page.goto("/forgot-password");
    await expect(page.locator("form")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("studio, advisor, slots, quote, and search stay healthy", async ({ request }) => {
    const studioRes = await request.get(`${BASE_URL}/api/studio`);
    expect(studioRes.status()).toBe(200);
    const studio = await studioRes.json();
    expect(studio.studio.advisorId).toBeTruthy();
    expect(studio.paymentsEnabled).toBe(false);

    const advisorRes = await request.get(`${BASE_URL}/api/advisors/${studio.studio.advisorId}`);
    expect(advisorRes.status()).toBe(200);
    const { advisor } = await advisorRes.json();
    expect(advisor.services.length).toBeGreaterThan(0);
    expect(advisor.schedule.length).toBeGreaterThan(0);

    const serviceId = advisor.services[0].id;
    const date = nextSaturday();
    const slotsRes = await request.get(
      `${BASE_URL}/api/slots?advisorId=${advisor.id}&serviceId=${serviceId}&date=${date}`
    );
    expect(slotsRes.status()).toBe(200);
    const { slots } = await slotsRes.json();
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some((slot: { available: boolean }) => slot.available)).toBe(true);

    const quoteRes = await request.get(`${BASE_URL}/api/checkout/quote?serviceId=${serviceId}`);
    expect(quoteRes.status()).toBe(200);
    const quote = await quoteRes.json();
    expect(quote.quote.totalCents).toBe(1000);
    expect(quote.quote.platformFeeCents).toBe(0);

    const searchRes = await request.get(`${BASE_URL}/api/services?search=pilates`);
    expect(searchRes.status(), await searchRes.text()).toBe(200);
    const search = await searchRes.json();
    expect(search.advisors.some((item: { name: string }) => /meropi|pilates/i.test(item.name))).toBe(true);
    expect(search.advisors[0].minPriceWithFee).toBe(search.advisors[0].minPrice);
  });
});

test.describe("Production · logged-in booking, cancel, and admin guards", () => {
  test("client can book, slot is taken, cancel frees the slot, admin APIs stay protected", async ({
    request,
  }) => {
    const studio = await (await request.get(`${BASE_URL}/api/studio`)).json();
    const advisorId = studio.studio.advisorId as string;
    const advisor = (await (await request.get(`${BASE_URL}/api/advisors/${advisorId}`)).json()).advisor;
    const serviceId = advisor.services[0].id as string;
    const date = nextSaturday();

    const openSlot = (await (
      await request.get(`${BASE_URL}/api/slots?advisorId=${advisorId}&serviceId=${serviceId}&date=${date}`)
    ).json()).slots.find((slot: { available: boolean; remaining: number; time: string }) => {
      return slot.available && slot.remaining > 0 && slot.time !== "08:00";
    });
    expect(openSlot, "need a free production slot").toBeTruthy();
    const time = openSlot.time as string;
    const bookedBefore = openSlot.booked as number;

    const stamp = Date.now();
    const email = `prod-e2e-${stamp}@example.com`;
    const password = "ProdE2ePass123";
    const name = "Production Tester";

    const signUp = await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
      headers: ORIGIN,
      data: { email, password, name },
    });
    expect(signUp.status(), await signUp.text()).toBe(200);

    const signIn = await request.post(`${BASE_URL}/api/auth/sign-in/email`, {
      headers: ORIGIN,
      data: { email, password },
    });
    expect(signIn.status(), await signIn.text()).toBe(200);
    const sessionToken = extractSessionToken(signIn.headers()["set-cookie"]);
    expect(sessionToken).toBeTruthy();
    const cookie = sessionCookieHeader(sessionToken!);

    const quote = await (await request.get(`${BASE_URL}/api/checkout/quote?serviceId=${serviceId}`)).json();

    const book = await request.post(`${BASE_URL}/api/appointments`, {
      headers: { ...ORIGIN, ...cookie, "content-type": "application/json" },
      data: {
        advisorId,
        serviceId,
        scheduledAt: `${date}T${time}`,
      },
    });
    expect(book.status(), await book.text()).toBe(201);
    const booked = await book.json();
    expect(booked.appointment.status).toBe("CONFIRMED");
    expect(booked.appointment.totalCents).toBe(quote.quote.totalCents);
    expect(booked.appointment.platformFee).toBe(0);

    const afterBook = await slotAt(request, advisorId, serviceId, date, time);
    expect(afterBook?.booked).toBe(bookedBefore + 1);

    const list = await request.get(`${BASE_URL}/api/client/appointments`, { headers: cookie });
    expect(list.status()).toBe(200);
    const { appointments } = await list.json();
    expect(appointments.some((item: { id: string }) => item.id === booked.appointment.id)).toBe(true);

    const cancel = await request.patch(`${BASE_URL}/api/appointments/${booked.appointment.id}`, {
      headers: { ...cookie, "content-type": "application/json" },
      data: { reason: "Production smoke test cleanup" },
    });
    expect(cancel.status(), await cancel.text()).toBe(200);

    const afterCancel = await slotAt(request, advisorId, serviceId, date, time);
    expect(afterCancel?.booked).toBe(bookedBefore);

    const hidden = await request.get(`${BASE_URL}/api/client/appointments`, { headers: cookie });
    const remaining = await hidden.json();
    expect(remaining.appointments.some((item: { id: string }) => item.id === booked.appointment.id)).toBe(
      false
    );

    const adminDashboard = await request.get(`${BASE_URL}/api/admin/dashboard`);
    expect(adminDashboard.status()).toBe(401);
    const adminContent = await request.get(`${BASE_URL}/api/admin/studio/content`);
    expect(adminContent.status()).toBe(401);
    const adminSchedule = await request.get(`${BASE_URL}/api/admin/studio/schedule`);
    expect(adminSchedule.status()).toBe(401);

    const clientAdmin = await request.get(`${BASE_URL}/api/admin/dashboard`, { headers: cookie });
    expect(clientAdmin.status()).toBe(403);
    const clientUsers = await request.get(`${BASE_URL}/api/admin/users?search=meropi`, { headers: cookie });
    expect(clientUsers.status()).toBe(403);
  });

  test("admin pages redirect guests to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/admin/schedule");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/admin/content");
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/login/);
  });
});
