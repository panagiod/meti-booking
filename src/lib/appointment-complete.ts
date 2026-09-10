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
