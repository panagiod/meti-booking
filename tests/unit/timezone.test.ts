import { describe, it, expect } from "vitest";
import {
  localToUTCDate,
  utcMinutesToLocal,
  parseLocalISO,
} from "@/lib/timezone";

describe("lib/timezone", () => {
  it("localToUTCDate convierte hora Colombia (UTC-5) a UTC explícito", () => {
    const d = localToUTCDate(2026, 8, 17, 9, 0);
    expect(d.toISOString()).toBe("2026-08-17T14:00:00.000Z");
  });

  it("localToUTCDate maneja medianoche y horas de la mañana", () => {
    const d = localToUTCDate(2026, 1, 1, 0, 30);
    expect(d.toISOString()).toBe("2026-01-01T05:30:00.000Z");
  });

  it("utcMinutesToLocal convierte 14:00 UTC a 09:00 local", () => {
    expect(utcMinutesToLocal(14 * 60)).toBe(9 * 60);
  });

  it("utcMinutesToLocal envuelve correctamente pasada la medianoche", () => {
    // 03:00 UTC → 22:00 local del día anterior (envuelto)
    expect(utcMinutesToLocal(3 * 60)).toBe(22 * 60);
    // 00:00 UTC → 19:00 local
    expect(utcMinutesToLocal(0)).toBe(19 * 60);
  });

  it("parseLocalISO ignora el offset del string y asume hora local Colombia", () => {
    const d = parseLocalISO("2026-08-17T09:30");
    expect(d?.toISOString()).toBe("2026-08-17T14:30:00.000Z");
  });

  it("parseLocalISO acepta segundos en el ISO", () => {
    const d = parseLocalISO("2026-08-17T09:30:00");
    expect(d?.toISOString()).toBe("2026-08-17T14:30:00.000Z");
  });

  it("parseLocalISO devuelve null para strings inválidos", () => {
    expect(parseLocalISO("no-es-fecha")).toBeNull();
    expect(parseLocalISO("")).toBeNull();
  });
});
