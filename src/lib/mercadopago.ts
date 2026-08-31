import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

export function getAppUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"
  );
}

interface PreferenceItem {
  id: string;
  title: string;
  description?: string;
  unitPriceCents: number;
}

interface CreatePreferenceParams {
  accessToken: string;
  items: PreferenceItem[];
  externalReference: string;
  payerEmail?: string;
}

// Crea una preferencia de Checkout Pro usando las credenciales del asesor
// (modelo sin custodia: el pago llega directo a la cuenta MP del asesor).
export async function createCheckoutPreference({
  accessToken,
  items,
  externalReference,
  payerEmail,
}: CreatePreferenceParams) {
  const client = new MercadoPagoConfig({ accessToken });
  const appUrl = getAppUrl();

  const preference = await new Preference(client).create({
    body: {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: 1,
        unit_price: item.unitPriceCents / 100,
        currency_id: "COP",
      })),
      external_reference: externalReference,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      back_urls: {
        success: `${appUrl}/checkout/result?appointmentId=${externalReference}&status=approved`,
        pending: `${appUrl}/checkout/result?appointmentId=${externalReference}&status=pending`,
        failure: `${appUrl}/checkout/result?appointmentId=${externalReference}&status=failure`,
      },
      // Nota: auto_return solo funciona en modo producción de MP, se omite por ahora
      statement_descriptor: "Meti",
      metadata: {
        appointment_id: externalReference,
      },
      ...(payerEmail ? { payer: { email: payerEmail } } : {}),
    },
  });

  if (!preference.id || !preference.init_point) {
    throw new Error("Mercado Pago no devolvió preference id/init_point");
  }

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point,
    // El checkout de sandbox usa su propio subdominio; init_point (www)
    // solo funciona con preferencias de producción.
    sandboxInitPoint: preference.sandbox_init_point || null,
  };
}

// Obtiene el detalle de un pago desde la API de Mercado Pago usando el
// access token del asesor (la verificación real nunca confía en el webhook).
export async function getPayment(accessToken: string, paymentId: string) {
  const client = new MercadoPagoConfig({ accessToken });
  return new Payment(client).get({ id: paymentId });
}
