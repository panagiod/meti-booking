import { Page, expect } from "@playwright/test";
import { BASE_URL } from "./api";

export const MP_TEST_PUBLIC_KEY = process.env.MP_TEST_PUBLIC_KEY!;
export const MP_TEST_ACCESS_TOKEN = process.env.MP_TEST_ACCESS_TOKEN!;

export const E2E_SKIP_MP_CHECKOUT = process.env.E2E_SKIP_MP_CHECKOUT === "1";

export const MP_TEST_BUYER_EMAIL = process.env.MP_TEST_BUYER_EMAIL || "";
export const MP_TEST_BUYER_PASSWORD = process.env.MP_TEST_BUYER_PASSWORD || "";

// Approved test card from the Mercado Pago sandbox
export const TEST_CARD_APPROVED = {
  number: "5031 7557 3453 0604",
  expiry: "12/30",
  cvv: "123",
  holder: "APRO",
  dni: "12345678",
};

// The seller's sandbox account may be broken on MP's side (creates
// preferences but its checkout won't load). This error is thrown so the
// suite marks the test as skipped with a clear reason, not as a failure.
export const MP_CHECKOUT_UNAVAILABLE = "MP_CHECKOUT_UNAVAILABLE";

// ============================================================
// Completes Mercado Pago sandbox checkout in the browser.
// Note: the sandbox uses the same checkout domain as production
// (www.mercadopago.com.co); test mode is determined by the seller's
// credentials (sandbox pref_id).
// MP's UI changes frequently: multiple fallback selectors and generous
// timeouts are used. Returns the real paymentId.
// ============================================================
export async function paySandboxCheckout(
  page: Page,
  initPoint: string,
  buyerEmail: string
): Promise<string | null> {
  expect(initPoint).toContain("mercadopago");
  expect(initPoint).toContain("/checkout/v1/redirect");

  await page.goto(initPoint, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // Detect MP's generic error ("Hubo un error accediendo a esta pagina...")
  // which appears when the seller's sandbox account cannot process checkouts.
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes("error") && document.body.innerText.length < 600,
      { timeout: 8_000 }
    );
    if ((await page.locator("body").innerText()).includes("Hubo un error accediendo")) {
      throw new Error(MP_CHECKOUT_UNAVAILABLE);
    }
  } catch (e) {
    if (e instanceof Error && e.message === MP_CHECKOUT_UNAVAILABLE) throw e;
    // waitForFunction timeout = page loaded normally, continue
  }

  // If MP asks to sign in as a test buyer, use the credentials
  if (MP_TEST_BUYER_EMAIL && MP_TEST_BUYER_PASSWORD) {
    await clickIfPresent(page, ['text="Iniciar sesión"', 'button:has-text("Ingresar")', 'text="Ingresa a tu cuenta"']);
    const emailInput = page.locator('input[type="email"], input[name="user_id"], input[name="email"]').first();
    if (await emailInput.count()) {
      await emailInput.fill(MP_TEST_BUYER_EMAIL);
      const passInput = page.locator('input[type="password"]').first();
      if (await passInput.count()) await passInput.fill(MP_TEST_BUYER_PASSWORD);
      await clickIfPresent(page, ['button:has-text("Ingresar")', 'button[type="submit"]']);
      await page.waitForTimeout(3_000);
    }
  }

  // Some checkout versions show a document type step
  await selectIfPresent(page, [
    'select[name="docType"]',
    'select[id="docType"]',
  ], "DNI");

  // Choose card payment if payment method tabs are shown
  await clickIfPresent(page, [
    'img[alt="Visa"]',
    'div[data-qa="card-type-selector"] >> text=Visa',
    'text="Tarjeta"',
    'text="Tarjeta de crédito"',
  ]);

  // If saved cards from previous runs exist: "use new card"
  await clickIfPresent(page, [
    'text="Nueva tarjeta"',
    'button:has-text("nueva tarjeta")',
    '[data-testid="new-card"]',
  ]);

  const inputFns: Array<[string[], string]> = [
    // [fallback selectors, value]
    [['input[name="cardNumber"]', '#cardNumber', '[data-checkout="cardNumber"]'], TEST_CARD_APPROVED.number],
    [['input[name="cardholderName"]', '#cardholderName', '[data-checkout="cardholderName"]'], TEST_CARD_APPROVED.holder],
    [['input[name="cardExpirationDate"]', '#cardExpirationDate', '[data-checkout="cardExpirationDate"]'], TEST_CARD_APPROVED.expiry],
    [['input[name="securityCode"]', '#securityCode', '[data-checkout="securityCode"]'], TEST_CARD_APPROVED.cvv],
    [['input[name="docNumber"]', '#docNumber', '[data-checkout="docNumber"]'], TEST_CARD_APPROVED.dni],
    [['input[name="email"]', '#email', '[data-checkout="email"]'], buyerEmail],
  ];

  for (const [selectors, value] of inputFns) {
    await fillIfPresent(page, selectors, value);
  }

  // Pay button
  const payButton = page.locator(
    'button:has-text("Pagar"), input[type="submit"], button[type="submit"]'
  ).first();
  await expect(payButton).toBeVisible({ timeout: 30_000 });
  await payButton.click();

  // Wait for MP to redirect back to the app
  await page.waitForURL(
    (url) => url.origin === new URL(BASE_URL).origin && url.pathname.includes("/checkout/result"),
    { timeout: 90_000 }
  );

  const paymentId = page.url().match(/payment_id=([^&]+)/)?.[1] || null;
  return paymentId;
}

async function fillIfPresent(page: Page, selectors: string[], value: string) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.count()) {
      try {
        await loc.waitFor({ state: "visible", timeout: 15_000 });
        await loc.fill(value);
        return;
      } catch {
        // try next selector
      }
    }
  }
}

async function clickIfPresent(page: Page, selectors: string[]) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.count()) {
      try {
        await loc.click({ timeout: 5_000 });
        await page.waitForTimeout(800);
        return;
      } catch {
        // try next selector
      }
    }
  }
}

async function selectIfPresent(page: Page, selectors: string[], value: string) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    if (await loc.count()) {
      try {
        await loc.selectOption(value, { timeout: 5_000 });
        return;
      } catch {
        // try next selector
      }
    }
  }
}
