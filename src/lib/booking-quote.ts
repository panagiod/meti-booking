import { calculatePrices } from "@/lib/pricing";
import { isPaymentsEnabled } from "@/lib/payments-config";

export type BookingQuote = {
  serviceId: string;
  serviceName: string;
  servicePriceCents: number;
  discountCents: number;
  platformFeeCents: number;
  instructorEarningCents: number;
  totalCents: number;
  feePercentage: number;
  promotion: {
    id: string;
    name: string;
    discountType: string;
    discountValue: number;
  } | null;
};

export function buildBookingQuote(params: {
  serviceId: string;
  serviceName: string;
  servicePriceCents: number;
  feePercentage?: number;
  maxFeeCents?: number | null;
  discountCents?: number;
  promotion?: BookingQuote["promotion"];
}): BookingQuote {
  const discountCents = params.discountCents ?? 0;
  const feePercentage = params.feePercentage ?? 15;

  if (!isPaymentsEnabled()) {
    const netCents = Math.max(0, params.servicePriceCents - discountCents);
    return {
      serviceId: params.serviceId,
      serviceName: params.serviceName,
      servicePriceCents: params.servicePriceCents,
      discountCents,
      platformFeeCents: 0,
      instructorEarningCents: netCents,
      totalCents: netCents,
      feePercentage: 0,
      promotion: params.promotion ?? null,
    };
  }

  const { instructorEarning, platformFee, totalCents } = calculatePrices({
    servicePriceCents: params.servicePriceCents,
    feePercentage,
    maxFeeCents: params.maxFeeCents ?? null,
    discountCents,
  });

  return {
    serviceId: params.serviceId,
    serviceName: params.serviceName,
    servicePriceCents: params.servicePriceCents,
    discountCents,
    platformFeeCents: platformFee,
    instructorEarningCents: instructorEarning,
    totalCents,
    feePercentage,
    promotion: params.promotion ?? null,
  };
}
