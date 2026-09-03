// Central appointment pricing calculation.
// Business rule: the platform fee is ALWAYS calculated on the ORIGINAL
// service price; the instructor absorbs the discount (promotion).
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
}): { instructorEarning: number; platformFee: number; totalCents: number } {
  const instructorEarning = Math.max(servicePriceCents - discountCents, 0);
  let platformFee = Math.round(servicePriceCents * (feePercentage / 100));

  if (maxFeeCents && platformFee > maxFeeCents) {
    platformFee = maxFeeCents;
  }

  const totalCents = instructorEarning + platformFee;
  return { instructorEarning, platformFee, totalCents };
}
