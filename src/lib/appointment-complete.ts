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

/** Same number the Clients page shows — older completed rows stay in the database. */
export const COMPLETED_HISTORY_LIMIT = 8;

export function idsBeyondCompletedHistoryLimit<
  T extends { id: string; clientId: string; scheduledAt: Date },
>(rows: T[], limit = COMPLETED_HISTORY_LIMIT): string[] {
  const kept = new Map<string, number>();
  const extra: string[] = [];
  const newestFirst = [...rows].sort(
    (a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime()
  );
  for (const row of newestFirst) {
    const count = kept.get(row.clientId) ?? 0;
    if (count >= limit) extra.push(row.id);
    else kept.set(row.clientId, count + 1);
  }
  return extra;
}

const RETAINED_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "NO_SHOW",
] as const;

/** Upcoming bookings plus the completed classes we still keep (client dashboard). */
export function retainedAppointmentWhere() {
  return {
    status: { in: [...RETAINED_STATUSES] },
  };
}

/** Admin client cards also show recent cancellations. */
export function adminClientAppointmentWhere() {
  return {
    status: { in: [...RETAINED_STATUSES, "CANCELLED"] },
  };
}

/** Cancelled rows kept for admin history (newest first). Older rows are pruned by cron. */
export const CANCELLED_HISTORY_LIMIT = 100;

export function idsBeyondCancelledHistoryLimit<
  T extends { id: string; cancelledAt: Date | null; updatedAt: Date },
>(rows: T[], limit = CANCELLED_HISTORY_LIMIT): string[] {
  const sorted = [...rows].sort((a, b) => {
    const aTime = (a.cancelledAt ?? a.updatedAt).getTime();
    const bTime = (b.cancelledAt ?? b.updatedAt).getTime();
    return bTime - aTime;
  });
  if (sorted.length <= limit) return [];
  return sorted.slice(limit).map((row) => row.id);
}
