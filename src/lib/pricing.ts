// Central appointment pricing calculation.
// Business rule: the platform fee is ALWAYS calculated on the ORIGINAL
// service price; the advisor absorbs the discount (promotion).
// If the calculated fee exceeds maxFeeCents, maxFeeCents is used.
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

  // Apply maximum fee if configured
  if (maxFeeCents && platformFee > maxFeeCents) {
    platformFee = maxFeeCents;
  }

  const totalCents = advisorEarning + platformFee;
  return { advisorEarning, platformFee, totalCents };
}
