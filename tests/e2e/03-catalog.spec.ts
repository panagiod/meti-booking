import { test, expect } from "@playwright/test";
import { newApi, withSession, BASE_URL } from "../helpers/api";
import { prisma } from "../helpers/db";
import { createActiveAdvisor } from "../helpers/fixtures";
import { E2E_SKIP_MP_CHECKOUT } from "../helpers/mp";

test.describe("03 · Catálogo público", () => {
  test("lista asesores activos, visibles y expone mpMode; excluye ocultos e inactivos", async ({ request }) => {
    const api = newApi(request);
    const visible = await createActiveAdvisor(request, { withMP: true, mpMode: "TEST" });
    const hidden = await createActiveAdvisor(request, { hidden: true });
    await createActiveAdvisor(request).then(async (f) => {
      await prisma.advisorProfile.update({
        where: { id: f.advisorId },
        data: { isActive: false },
      });
    });

    const res = await api.get(`${BASE_URL}/api/services`);
    expect(res.status()).toBe(200);
    const { advisors } = await res.json();

    const ids = advisors.map((a: any) => a.id);
    expect(ids).toContain(visible.advisorId);
    expect(ids).not.toContain(hidden.advisorId);

    const visibleAdvisor = advisors.find((a: any) => a.id === visible.advisorId);
    expect(visibleAdvisor.mpMode).toBe("TEST");
    expect(visibleAdvisor.minPrice).toBe(10000);
    expect(visibleAdvisor.minPriceWithFee).toBe(11500);
    expect(visibleAdvisor.categories).toContain("Legal");

    // Todos los listados son activos y visibles
    for (const a of advisors) {
      const db = await prisma.advisorProfile.findUnique({ where: { id: a.id } });
      expect(db?.isActive).toBe(true);
      expect(db?.isHidden).toBe(false);
    }
  });

  test("búsqueda por nombre filtra asesores", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request);
    const dbAdvisor = await prisma.advisorProfile.findUnique({
      where: { id: fixture.advisorId },
      include: { user: true },
    });

    const res = await api.get(`${BASE_URL}/api/services?search=${encodeURIComponent(dbAdvisor!.user.name)}`);
    const { advisors } = await res.json();
    expect(advisors.some((a: any) => a.id === fixture.advisorId)).toBe(true);

    const none = await api.get(`${BASE_URL}/api/services?search=e2e-no-existe-xyz`);
    const { advisors: empty } = await none.json();
    expect(empty.length).toBe(0);
  });

  test("perfil público del asesor incluye servicios, horario y mpMode", async ({ request }) => {
    const api = newApi(request);
    const fixture = await createActiveAdvisor(request, { withMP: true, mpMode: "PRODUCTION" });

    const res = await api.get(`${BASE_URL}/api/advisors/${fixture.advisorId}`);
    expect(res.status()).toBe(200);
    const { advisor } = await res.json();

    expect(advisor.id).toBe(fixture.advisorId);
    expect(advisor.mpMode).toBe("PRODUCTION");
    expect(advisor.services.length).toBe(1);
    expect(advisor.schedule.length).toBe(7);
  });

  test("UI: listado muestra ribbon PRUEBA para asesor en modo test", async ({ page, request }) => {
    test.skip(E2E_SKIP_MP_CHECKOUT, "skip MP UI");

    await createActiveAdvisor(request, { withMP: true, mpMode: "TEST" });

    await page.goto("/services", { waitUntil: "domcontentloaded" });

    const ribbon = page.locator('text="PRUEBA"').first();
    await expect(ribbon).toBeVisible({ timeout: 30_000 });
  });

  test("UI: tarjeta de asesor navega a su perfil público", async ({ page, request }) => {
    const fixture = await createActiveAdvisor(request);

    await page.goto("/services", { waitUntil: "domcontentloaded" });

    const card = page.locator(`a[href="/advisor/${fixture.advisorId}"]`).first();
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.click();
    await page.waitForURL(`**/advisor/${fixture.advisorId}`);
  });
});
