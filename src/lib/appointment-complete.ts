export function sessionEndAt(scheduledAt: Date, durationMin: number): Date {
  const minutes = Number.isFinite(durationMin) ? Math.max(0, durationMin) : 0;
  return new Date(scheduledAt.getTime() + minutes * 60 * 1000);
}

export function sessionHasEnded(
  scheduledAt: Date,
  durationMin: number,
  now = new Date()
): boolean {
  return sessionEndAt(scheduledAt, durationMin).getTime() <= now.getTime();
}

export function idsToComplete<T extends { id: string; scheduledAt: Date; durationMin: number }>(
  rows: T[],
  now = new Date()
): string[] {
  return rows
    .filter((row) => sessionHasEnded(row.scheduledAt, row.durationMin, now))
    .map((row) => row.id);
}

/** Completed and no-show class records older than this are deleted. */
export const COMPLETED_RETENTION_DAYS = 365;

export function completedRetentionCutoff(now = new Date()): Date {
  return new Date(now.getTime() - COMPLETED_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

/** Upcoming bookings plus completed classes still inside the retention window. */
export function retainedAppointmentWhere(now = new Date()) {
  const cutoff = completedRetentionCutoff(now);
  return {
    OR: [
      { status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] } },
      {
        status: { in: ["COMPLETED", "NO_SHOW"] },
        scheduledAt: { gte: cutoff },
      },
    ],
  };
}
