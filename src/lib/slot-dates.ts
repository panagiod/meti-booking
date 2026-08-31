const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseSlotDates(datesParam: string | null): string[] {
  if (!datesParam) return [];
  const unique = [...new Set(datesParam.split(",").map((d) => d.trim()).filter(Boolean))];
  return unique.filter((d) => DATE_RE.test(d));
}

export function isValidSlotDate(date: string): boolean {
  return DATE_RE.test(date);
}
