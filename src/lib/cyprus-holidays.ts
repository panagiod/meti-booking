import { parseStudioDateOnly, studioDateStrFromUtc } from "@/lib/timezone";

export interface CyprusHoliday {
  date: string;
  name: string;
  nameEl: string;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function shiftDate(dateStr: string, days: number): string {
  const parts = parseStudioDateOnly(dateStr);
  if (!parts) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return toDateStr(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

/** Orthodox Easter (Pascha) as a Gregorian YYYY-MM-DD. */
export function orthodoxEasterDate(year: number): string {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  const gregorianOffset = Math.floor(year / 100) - Math.floor(year / 400) - 2;
  const utc = new Date(Date.UTC(year, month - 1, day + gregorianOffset));
  return toDateStr(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate());
}

const FIXED_HOLIDAYS: Array<{ month: number; day: number; name: string; nameEl: string }> = [
  { month: 1, day: 1, name: "New Year's Day", nameEl: "Πρωτοχρονιά" },
  { month: 1, day: 6, name: "Epiphany", nameEl: "Θεοφάνια" },
  { month: 3, day: 25, name: "Greek Independence Day", nameEl: "25η Μαρτίου" },
  { month: 4, day: 1, name: "Cyprus National Day", nameEl: "Επέτειος ΕΟΚΑ" },
  { month: 5, day: 1, name: "Labour Day", nameEl: "Πρωτομαγιά" },
  { month: 8, day: 15, name: "Assumption", nameEl: "Κοίμηση της Θεοτόκου" },
  { month: 10, day: 1, name: "Cyprus Independence Day", nameEl: "Ημέρα Ανεξαρτησίας" },
  { month: 10, day: 28, name: "Ochi Day", nameEl: "Επέτειος του Όχι" },
  { month: 12, day: 24, name: "Christmas Eve", nameEl: "Παραμονή Χριστουγέννων" },
  { month: 12, day: 25, name: "Christmas Day", nameEl: "Χριστούγεννα" },
  { month: 12, day: 26, name: "Boxing Day", nameEl: "Σύναξη Θεοτόκου" },
];

/** Official Republic of Cyprus public-service holidays for a calendar year. */
export function cyprusPublicHolidays(year: number): CyprusHoliday[] {
  const easter = orthodoxEasterDate(year);
  const holidays = new Map<string, CyprusHoliday>();

  for (const holiday of FIXED_HOLIDAYS) {
    const date = toDateStr(year, holiday.month, holiday.day);
    holidays.set(date, { date, name: holiday.name, nameEl: holiday.nameEl });
  }

  const movable: CyprusHoliday[] = [
    { date: shiftDate(easter, -48), name: "Green Monday", nameEl: "Καθαρά Δευτέρα" },
    { date: shiftDate(easter, -2), name: "Good Friday", nameEl: "Μεγάλη Παρασκευή" },
    { date: shiftDate(easter, 1), name: "Easter Monday", nameEl: "Δευτέρα του Πάσχα" },
    {
      date: shiftDate(easter, 50),
      name: "Holy Spirit Monday",
      nameEl: "Δευτέρα Αγίου Πνεύματος",
    },
  ];

  for (const holiday of movable) {
    if (!holidays.has(holiday.date)) {
      holidays.set(holiday.date, holiday);
    }
  }

  return [...holidays.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function getCyprusHoliday(dateStr: string): CyprusHoliday | null {
  const parts = parseStudioDateOnly(dateStr);
  if (!parts) return null;
  return cyprusPublicHolidays(parts.year).find((holiday) => holiday.date === dateStr) ?? null;
}

export function isCyprusPublicHoliday(dateStr: string): boolean {
  return getCyprusHoliday(dateStr) !== null;
}

export function upcomingCyprusHolidays(from: Date = new Date(), throughYear?: number): CyprusHoliday[] {
  const start = studioDateStrFromUtc(from);
  const startYear = Number(start.slice(0, 4));
  const endYear = throughYear ?? startYear + 1;
  const holidays: CyprusHoliday[] = [];
  for (let year = startYear; year <= endYear; year++) {
    holidays.push(...cyprusPublicHolidays(year));
  }
  return holidays.filter((holiday) => holiday.date >= start);
}
