import { describe, it, expect } from "vitest";
import { generateAvailableSlots } from "@/lib/slots";
import type { Schedule } from "@/lib/slots";

const baseSchedule: Schedule = {
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "12:00",
  lunchStart: null,
  lunchEnd: null,
  gapMinutes: 0,
};

describe("lib/slots — generateAvailableSlots", () => {
  it("genera slots según duración y rango del horario", () => {
    const slots = generateAvailableSlots(baseSchedule, 60);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:00", "11:00"]);
    expect(slots.every((s) => s.available)).toBe(true);
  });

  it("no genera un slot que sobrepasa el fin del horario", () => {
    const slots = generateAvailableSlots(baseSchedule, 90);
    // 09:00, 10:30 → 12:00 exacto no entra (10:30+90=12:00 == end, entra);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:30"]);
  });

  it("aplica el gap entre citas", () => {
    const slots = generateAvailableSlots({ ...baseSchedule, gapMinutes: 30 }, 60);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:30"]);
  });

  it("omite el bloque de almuerzo y no genera slots que lo crucen", () => {
    const slots = generateAvailableSlots(
      { ...baseSchedule, startTime: "09:00", endTime: "15:00", lunchStart: "12:00", lunchEnd: "13:00" },
      60
    );
    expect(slots.map((s) => s.time)).toEqual([
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
    ]);
  });

  it("un slot de 90 min que cruzaría el almuerzo se salta al fin del almuerzo", () => {
    const slots = generateAvailableSlots(
      { ...baseSchedule, startTime: "09:00", endTime: "15:00", lunchStart: "12:00", lunchEnd: "13:00" },
      90
    );
    expect(slots.map((s) => s.time)).toEqual(["09:00", "10:30", "13:00"]);
  });

  it("marca como no disponible slots que chocan con citas existentes (UTC→local)", () => {
    // Cita existente a las 14:00 UTC = 09:00 local Colombia
    const aptStart = new Date("2026-08-17T14:00:00.000Z");
    const aptEnd = new Date("2026-08-17T15:00:00.000Z");
    const slots = generateAvailableSlots(baseSchedule, 60, [{ start: aptStart, end: aptEnd }]);
    expect(slots.find((s) => s.time === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(true);
  });

  it("marca como no disponible un día con bloqueo all-day", () => {
    const day = new Date("2026-08-17T12:00:00.000Z");
    const slots = generateAvailableSlots(
      baseSchedule,
      60,
      [],
      [{ startDate: new Date("2026-08-17T00:00:00.000Z"), endDate: new Date("2026-08-17T23:59:59.000Z"), isAllDay: true }],
      day
    );
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((s) => !s.available)).toBe(true);
  });

  it("marca como no disponible slots antes de minStartTime (anticipación)", () => {
    const day = new Date(2026, 7, 17, 12, 0, 0); // mediodía local del servidor
    const minStart = new Date(2026, 7, 17, 10, 0, 0);
    const slots = generateAvailableSlots(baseSchedule, 60, [], [], day, minStart);
    expect(slots.find((s) => s.time === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(true);
    expect(slots.find((s) => s.time === "11:00")?.available).toBe(true);
  });

  it("bloqueo por rango de horas marca solo los slots que se solapan", () => {
    const day = new Date(2026, 7, 17, 12, 0, 0);
    const slots = generateAvailableSlots(
      baseSchedule,
      60,
      [],
      [
        {
          startDate: new Date(2026, 7, 17, 9, 30, 0),
          endDate: new Date(2026, 7, 17, 10, 30, 0),
          isAllDay: false,
        },
      ],
      day
    );
    expect(slots.find((s) => s.time === "09:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "11:00")?.available).toBe(true);
  });
});
