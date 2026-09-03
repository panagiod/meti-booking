import { test, expect } from "@playwright/test";
import { newApi, BASE_URL } from "../helpers/api";
import { createStudioInstructor } from "../helpers/fixtures";

test.describe("03 · Studio booking API", () => {
  test("returns the studio instructor, reformer services, and schedule", async ({ request }) => {
    const api = newApi(request);
    await createStudioInstructor(request, { withMP: true, mpMode: "TEST" });

    const res = await api.get(`${BASE_URL}/api/studio`);
    expect(res.status()).toBe(200);
    const { studio, paymentsEnabled } = await res.json();

    expect(studio.instructorId).toBeTruthy();
    expect(studio.instructorName).toBeTruthy();
    expect(Array.isArray(studio.services)).toBe(true);
    expect(Array.isArray(studio.schedule)).toBe(true);
    expect(typeof paymentsEnabled).toBe("boolean");
  });

  test("legacy /advisor URLs redirect to book", async ({ page }) => {
    await page.goto("/advisor/some-old-id", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/book/);
  });
});
