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

// Creates a Checkout Pro preference using the advisor's credentials
// (no-custody model: payment goes directly to the advisor's MP account).
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
      // Note: auto_return only works in MP production mode, omitted for now
      statement_descriptor: "Meti",
      metadata: {
        appointment_id: externalReference,
      },
      ...(payerEmail ? { payer: { email: payerEmail } } : {}),
    },
  });

  if (!preference.id || !preference.init_point) {
    throw new Error("Mercado Pago did not return preference id/init_point");
  }

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point,
    // Sandbox checkout uses its own subdomain; init_point (www)
    // only works with production preferences.
    sandboxInitPoint: preference.sandbox_init_point || null,
  };
}

// Gets payment details from the Mercado Pago API using the
// advisor's access token (real verification never trusts the webhook).
export async function getPayment(accessToken: string, paymentId: string) {
  const client = new MercadoPagoConfig({ accessToken });
  return new Payment(client).get({ id: paymentId });
}
