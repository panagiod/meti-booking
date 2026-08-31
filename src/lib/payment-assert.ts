type MpPayment = {
  status?: string;
  transaction_amount?: number;
  external_reference?: string;
  currency_id?: string;
};

export class PaymentVerificationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_APPROVED"
      | "REFERENCE_MISMATCH"
      | "AMOUNT_MISMATCH"
      | "ALREADY_USED"
  ) {
    super(message);
    this.name = "PaymentVerificationError";
  }
}

export function assertPaymentMatchesAppointment(
  payment: MpPayment,
  appointment: { id: string; totalCents: number }
): void {
  if (payment.status !== "approved") {
    throw new PaymentVerificationError(
      `Payment status is ${payment.status ?? "unknown"}`,
      "NOT_APPROVED"
    );
  }

  if (payment.external_reference && payment.external_reference !== appointment.id) {
    throw new PaymentVerificationError(
      "Payment external_reference does not match appointment",
      "REFERENCE_MISMATCH"
    );
  }

  const expectedAmount = appointment.totalCents / 100;
  const paidAmount = payment.transaction_amount ?? 0;
  if (Math.abs(paidAmount - expectedAmount) > 0.01) {
    throw new PaymentVerificationError(
      `Payment amount ${paidAmount} does not match expected ${expectedAmount}`,
      "AMOUNT_MISMATCH"
    );
  }
}
