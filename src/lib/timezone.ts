// Timezone de la app (Colombia, UTC-5)
// Todas las agendas y slots se interpretan en esta timezone,
// independientemente del timezone del servidor (Vercel usa UTC).
export const APP_TIMEZONE_OFFSET_HOURS = -5;

// Convierte hora local (Colombia) a un timestamp UTC explícito.
// Ejemplo: 2026-08-17 09:00 local → 2026-08-17T14:00:00.000Z
export function localToUTCDate(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number
): Date {
  return new Date(
    Date.UTC(year, month - 1, day, hour - APP_TIMEZONE_OFFSET_HOURS, minute)
  );
}

// Convierte minutos UTC a minutos locales (Colombia).
// Ejemplo: 14:00 UTC → 09:00 local
export function utcMinutesToLocal(utcMinutes: number): number {
  return (((utcMinutes + APP_TIMEZONE_OFFSET_HOURS * 60) % (24 * 60)) + 24 * 60) % (24 * 60);
}

// Extrae fecha/hora de un ISO string (ignora el offset del string,
// se asume que los componentes representan hora local de Colombia).
export function parseLocalISO(iso: string): Date | null {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  return localToUTCDate(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5])
  );
}
