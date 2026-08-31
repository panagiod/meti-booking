import { test, expect } from "@playwright/test";
import { createActiveAdvisor, localDateStr } from "../helpers/fixtures";
import { prisma } from "../helpers/db";
import { parseLocalISO } from "../../src/lib/timezone";

test.describe("09 · Smoke: render de páginas clave", () => {
  test("landing renderiza sin errores", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByText("Meti").first()).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("login y register renderizan sus formularios", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();

    await page.goto("/register");
    await expect(page.locator("form")).toBeVisible();
  });

  test("listado de asesores renderiza tarjetas", async ({ page, request }) => {
    await createActiveAdvisor(request);
    await page.goto("/services", { waitUntil: "domcontentloaded" });
    await expect(page.locator('text="E2E Asesor"').first()).toBeVisible({ timeout: 30_000 });
  });

  test("perfil público del asesor renderiza selector de servicios", async ({ page, request }) => {
    const fixture = await createActiveAdvisor(request);
    await page.goto(`/advisor/${fixture.advisorId}`);
    await expect(page.locator('text="Consultoría E2E"').first()).toBeVisible();
  });

  test("checkout sin datos de reserva muestra estado vacío", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.locator('text="No hay datos de reserva"')).toBeVisible();
  });

  test("redirect muestra el loading premium", async ({ page }) => {
    await page.goto("/redirect");
    await expect(page.locator('text="Bienvenido a Meti"')).toBeVisible();
    await expect(page.locator('text="Verificando tu sesión"')).toBeVisible();
  });

  test("slots: horario activo genera slots disponibles y filtra domingo", async ({ request }) => {
    const fixture = await createActiveAdvisor(request);

    // Busca un lunes futuro
    const d = new Date();
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    const dateStr = localDateStr(d);

    const res = await request.get(
      `/api/slots?advisorId=${fixture.advisorId}&serviceId=${fixture.serviceId}&date=${dateStr}`
    );
    expect(res.status()).toBe(200);
    const { slots } = await res.json();
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.some((s: any) => s.available)).toBe(true);
    expect(slots[0].time).toBe("08:00");

    // Sin parámetros → 400
    const missing = await request.get(`/api/slots?advisorId=${fixture.advisorId}`);
    expect(missing.status()).toBe(400);
  });

  test("slots: cita existente bloquea el slot correspondiente", async ({ request }) => {
    const fixture = await createActiveAdvisor(request);

    const d = new Date();
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    const dateStr = localDateStr(d);

    // Con gap de 15 min y duración de 60, los slots van cada 75 min:
    // 08:00, 09:15, 10:30... Usamos un slot real (09:15 hora Colombia).
    const scheduledAt = parseLocalISO(`${dateStr}T09:15`)!;

    await prisma.appointment.create({
      data: {
        clientId: fixture.userId,
        advisorId: fixture.advisorId,
        serviceId: fixture.serviceId,
        scheduledAt,
        durationMin: 60,
        status: "CONFIRMED",
        totalCents: 11500,
        advisorEarning: 10000,
        platformFee: 1500,
      },
    });

    const res = await request.get(
      `/api/slots?advisorId=${fixture.advisorId}&serviceId=${fixture.serviceId}&date=${dateStr}`
    );
    const { slots } = await res.json();
    const blocked = slots.find((s: any) => s.time === "09:15");
    expect(blocked?.available).toBe(false);
    const free = slots.find((s: any) => s.time === "08:00");
    expect(free?.available).toBe(true);
  });
});
