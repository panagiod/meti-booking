import { describe, it, expect } from "vitest";
import {
  assertPaymentMatchesAppointment,
  PaymentVerificationError,
} from "@/lib/payment-assert";

describe("payment-verify", () => {
  const appointment = { id: "apt_123", totalCents: 5175 };

  it("accepts approved payment with matching reference and amount", () => {
    expect(() =>
      assertPaymentMatchesAppointment(
        {
          status: "approved",
          external_reference: "apt_123",
          transaction_amount: 51.75,
        },
        appointment
      )
    ).not.toThrow();
  });

  it("rejects wrong external_reference", () => {
    expect(() =>
      assertPaymentMatchesAppointment(
        {
          status: "approved",
          external_reference: "other",
          transaction_amount: 51.75,
        },
        appointment
      )
    ).toThrow(PaymentVerificationError);
  });

  it("rejects amount mismatch", () => {
    expect(() =>
      assertPaymentMatchesAppointment(
        {
          status: "approved",
          external_reference: "apt_123",
          transaction_amount: 1,
        },
        appointment
      )
    ).toThrow(PaymentVerificationError);
  });

  it("rejects non-approved status", () => {
    expect(() =>
      assertPaymentMatchesAppointment(
        {
          status: "pending",
          external_reference: "apt_123",
          transaction_amount: 51.75,
        },
        appointment
      )
    ).toThrow(PaymentVerificationError);
  });
});
