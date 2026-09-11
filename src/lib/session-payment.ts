/** Completed and no-show sessions are owed at the studio. Upcoming bookings are not billed yet. */
const PAYABLE_STATUSES = new Set(["COMPLETED", "NO_SHOW"]);

export function isPayableSessionStatus(status: string): boolean {
  return PAYABLE_STATUSES.has(status.trim().toUpperCase());
}

export function isSessionPaid(appointment: { paidAt?: Date | string | null }): boolean {
  return Boolean(appointment.paidAt);
}

export function isUnpaidPayableSession(appointment: {
  status: string;
  paidAt?: Date | string | null;
}): boolean {
  return isPayableSessionStatus(appointment.status) && appointment.paidAt === null;
}

export function unpaidSessionTotalCents(
  appointments: Array<{
    status: string;
    paidAt?: Date | string | null;
    totalCents?: number;
    isTest?: boolean;
  }>,
): number {
  return appointments.reduce((sum, appointment) => {
    if (appointment.isTest) return sum;
    if (!isUnpaidPayableSession(appointment)) return sum;
    return sum + (appointment.totalCents ?? 0);
  }, 0);
}

export function normalizePaidByName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, 120);
}
