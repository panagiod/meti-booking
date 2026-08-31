import { prisma } from "@/lib/prisma";
import {
  assertPaymentMatchesAppointment,
  PaymentVerificationError,
} from "@/lib/payment-assert";

export { assertPaymentMatchesAppointment, PaymentVerificationError };

export async function assertPaymentIdNotReused(
  paymentId: string,
  appointmentId: string
): Promise<void> {
  const existing = await prisma.appointment.findFirst({
    where: {
      paymentId,
      id: { not: appointmentId },
      status: { in: ["CONFIRMED", "IN_PROGRESS", "PENDING"] },
    },
    select: { id: true },
  });

  if (existing) {
    throw new PaymentVerificationError(
      "Payment ID is already linked to another appointment",
      "ALREADY_USED"
    );
  }
}
