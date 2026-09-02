function parsePaymentsEnabled(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

/** Server-side payments gate. Default: disabled. Set PAYMENTS_ENABLED=1 to enable Mercado Pago. */
export function isPaymentsEnabled(): boolean {
  return parsePaymentsEnabled(process.env.PAYMENTS_ENABLED);
}

/** Client-side mirror — keep NEXT_PUBLIC_PAYMENTS_ENABLED in sync with PAYMENTS_ENABLED. */
export function isPaymentsEnabledClient(): boolean {
  return parsePaymentsEnabled(process.env.NEXT_PUBLIC_PAYMENTS_ENABLED);
}
