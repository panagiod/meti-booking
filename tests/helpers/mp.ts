import { Page, expect } from "@playwright/test";
import { BASE_URL } from "./api";

export const MP_TEST_PUBLIC_KEY = process.env.MP_TEST_PUBLIC_KEY!;
export const MP_TEST_ACCESS_TOKEN = process.env.MP_TEST_ACCESS_TOKEN!;

export const E2E_SKIP_MP_CHECKOUT = process.env.E2E_SKIP_MP_CHECKOUT === "1";

export const MP_TEST_BUYER_EMAIL = process.env.MP_TEST_BUYER_EMAIL || "";
export const MP_TEST_BUYER_PASSWORD = process.env.MP_TEST_BUYER_PASSWORD || "";

// Tarjeta de prueba APROBADA del sandbox de Mercado Pago
export const TEST_CARD_APPROVED = {
  number: "5031 7557 3453 0604",
  expiry: "12/30",
  cvv: "123",
  holder: "APRO",
  dni: "12345678",
};

// La cuenta sandbox del vendedor puede estar rota del lado de MP (crea
// preferencias pero su checkout no carga). Se lanza este error para que la
// suite marque el test como skipped con una razón clara, no como fallo.
export const MP_CHECKOUT_UNAVAILABLE = "MP_CHECKOUT_UNAVAILABLE";

// ============================================================
// Completa el checkout de Mercado Pago sandbox en el navegador.
// Nota: el sandbox usa el mismo dominio del checkout real
// (www.mercadopago.com.co); lo que define el modo prueba son las
// credenciales del vendedor (pref_id de sandbox).
// La UI de MP cambia con frecuencia: se usan múltiples selectores
// de respaldo y timeouts generosos. Devuelve el paymentId real.
// ============================================================
export async function paySandboxCheckout(
  page: Page,
  initPoint: string,
  buyerEmail: string
): Promise<string | null> {
  expect(initPoint).toContain("mercadopago");
  expect(initPoint).toContain("/checkout/v1/redirect");

  await page.goto(initPoint, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // Detectar el error genérico de MP ("Hubo un error accediendo a esta pagina...")
  // que aparece cuando la cuenta sandbox del vendedor no puede procesar checkouts.
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
    // waitForFunction timeout = página cargó normal, continuar
  }

  // Si MP pide iniciar sesión como comprador de prueba, usar las credenciales
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

  // Algunas versiones del checkout muestran un paso de "tipo de documento"
  await selectIfPresent(page, [
    'select[name="docType"]',
    'select[id="docType"]',
  ], "DNI");

  // Elegir pago con tarjeta si hay tabs de medios de pago
  await clickIfPresent(page, [
    'img[alt="Visa"]',
    'div[data-qa="card-type-selector"] >> text=Visa',
    'text="Tarjeta"',
    'text="Tarjeta de crédito"',
  ]);

  // Si hay tarjetas guardadas de runs anteriores: "usar nueva tarjeta"
  await clickIfPresent(page, [
    'text="Nueva tarjeta"',
    'button:has-text("nueva tarjeta")',
    '[data-testid="new-card"]',
  ]);

  const inputFns: Array<[string[], string]> = [
    // [selectores de respaldo, valor]
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

  // Botón pagar
  const payButton = page.locator(
    'button:has-text("Pagar"), input[type="submit"], button[type="submit"]'
  ).first();
  await expect(payButton).toBeVisible({ timeout: 30_000 });
  await payButton.click();

  // Esperar a que MP redirija de vuelta a la app
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
        // probar siguiente selector
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
        // probar siguiente selector
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
        // probar siguiente selector
      }
    }
  }
}
