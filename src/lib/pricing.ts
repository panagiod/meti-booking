// Cálculo central de precios de una cita.
// Regla de negocio: el fee de la plataforma SIEMPRE se calcula sobre el precio
// ORIGINAL del servicio; el descuento (promoción) lo absorbe el asesor.
// Si el fee calculado supera maxFeeCents, se usa maxFeeCents.
export function calculatePrices({
  servicePriceCents,
  feePercentage,
  maxFeeCents,
  discountCents = 0,
}: {
  servicePriceCents: number;
  feePercentage: number;
  maxFeeCents?: number | null;
  discountCents?: number;
}): { advisorEarning: number; platformFee: number; totalCents: number } {
  const advisorEarning = Math.max(servicePriceCents - discountCents, 0);
  let platformFee = Math.round(servicePriceCents * (feePercentage / 100));

  // Aplicar fee máximo si está configurado
  if (maxFeeCents && platformFee > maxFeeCents) {
    platformFee = maxFeeCents;
  }

  const totalCents = advisorEarning + platformFee;
  return { advisorEarning, platformFee, totalCents };
}
