import { randomUUID } from "crypto";
import { DEFAULT_BOOKING_LEAD_HOURS } from "@/lib/booking-config";
import { buildDefaultStudioContent } from "@/lib/studio-content";
import { generateAvailableSlots, type TimeSlot } from "@/lib/slots";
import { SlotBookingError } from "@/lib/slot-booking-errors";
import {
  getDayOfWeekForStudioDate,
  studioDayBoundsUTC,
  studioLocalMinutesFromUtc,
  utcToStudioLocal,
} from "@/lib/timezone";
import { isValidSlotDate } from "@/lib/slot-dates";
import { REFORMER_SERVICE_NAME, siteConfig } from "@/lib/site-config";
import {
  STUDIO_SESSION_DURATION_MIN,
  studioScheduleSeedRows,
} from "@/lib/studio-schedule";
import { buildBookingQuote } from "@/lib/booking-quote";
import { resolveBookingLeadHours } from "@/lib/booking-config";

export const DEMO_STUDIO_ADVISOR_ID = "demo-studio-advisor";
export const DEMO_REFORMER_SERVICE_ID = "demo-reformer-service";

const DEMO_SERVICE_PRICE_CENTS = 1000;
const DEMO_FEE_PERCENTAGE = 15;

export function isDemoBookingMode(): boolean {
  if (process.env.BOOKING_DEMO_FALLBACK === "1" || process.env.BOOKING_DEMO_FALLBACK === "true") {
    return true;
  }
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) return true;
  // Local/dev URLs are never reachable on Vercel or other hosted previews.
  if (/localhost|127\.0\.0\.1/.test(dbUrl)) return true;
  return false;
}

export function isDemoAdvisorId(advisorId: string): boolean {
  return advisorId === DEMO_STUDIO_ADVISOR_ID;
}

export function isDemoServiceId(serviceId: string): boolean {
  return serviceId === DEMO_REFORMER_SERVICE_ID;
}

function demoScheduleRows() {
  return studioScheduleSeedRows().map((row) => ({
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    lunchStart: row.lunchStart,
    lunchEnd: row.lunchEnd,
    gapMinutes: row.gapMinutes,
  }));
}

export function getDemoStudioResponse() {
  const content = buildDefaultStudioContent();
  return {
    studio: {
      advisorId: DEMO_STUDIO_ADVISOR_ID,
      name: content.name,
    },
  };
}

export function getDemoAdvisorResponse() {
  const content = buildDefaultStudioContent();
  return {
    advisor: {
      id: DEMO_STUDIO_ADVISOR_ID,
      name: content.name,
      image: null,
      speciality: "Clinical Pilates & Reformer",
      bio: null,
      videoUrl: null,
      isVerified: true,
      mpMode: null,
      bookingLeadHours: DEFAULT_BOOKING_LEAD_HOURS,
      rating: 0,
      reviewCount: 0,
      categories: ["Pilates"],
      services: [
        {
          id: DEMO_REFORMER_SERVICE_ID,
          name: REFORMER_SERVICE_NAME,
          description: siteConfig.sessionTypes[0]?.description ?? "Reformer session",
          durationMin: STUDIO_SESSION_DURATION_MIN,
          priceCents: DEMO_SERVICE_PRICE_CENTS,
          rescheduleHoursMin: 24,
          promotion: null,
        },
      ],
      schedule: demoScheduleRows(),
    },
  };
}

export function getDemoSlotsForDates(dates: string[]): Record<string, TimeSlot[]> {
  const validDates = dates.filter((d) => isValidSlotDate(d));
  const leadHours = resolveBookingLeadHours(DEFAULT_BOOKING_LEAD_HOURS);
  const minStartTime =
    leadHours > 0 ? new Date(Date.now() + leadHours * 60 * 60 * 1000) : undefined;

  const result: Record<string, TimeSlot[]> = {};

  for (const date of validDates) {
    const dayOfWeek = getDayOfWeekForStudioDate(date);
    const daySchedule = demoScheduleRows().find((row) => row.dayOfWeek === dayOfWeek);

    if (!daySchedule) {
      result[date] = [];
      continue;
    }

    result[date] = generateAvailableSlots(
      {
        dayOfWeek: daySchedule.dayOfWeek,
        startTime: daySchedule.startTime,
        endTime: daySchedule.endTime,
        lunchStart: daySchedule.lunchStart,
        lunchEnd: daySchedule.lunchEnd,
        gapMinutes: daySchedule.gapMinutes,
      },
      STUDIO_SESSION_DURATION_MIN,
      [],
      [],
      new Date(`${date}T12:00:00`),
      minStartTime,
      siteConfig.slotCapacity
    );
  }

  return result;
}

function dateStrFromUtc(utc: Date): string {
  const local = utcToStudioLocal(utc);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${local.year}-${pad(local.month)}-${pad(local.day)}`;
}

export function validateDemoBookableSlot(scheduledAt: Date): void {
  const dateStr = dateStrFromUtc(scheduledAt);
  const dayOfWeek = getDayOfWeekForStudioDate(dateStr);
  const daySchedule = demoScheduleRows().find((row) => row.dayOfWeek === dayOfWeek);

  if (!daySchedule) {
    throw new SlotBookingError("This day is not available for booking", "INACTIVE_DAY");
  }

  const leadHours = resolveBookingLeadHours(DEFAULT_BOOKING_LEAD_HOURS);
  const minStartTime =
    leadHours > 0 ? new Date(Date.now() + leadHours * 60 * 60 * 1000) : undefined;

  const slots = generateAvailableSlots(
    {
      dayOfWeek: daySchedule.dayOfWeek,
      startTime: daySchedule.startTime,
      endTime: daySchedule.endTime,
      lunchStart: daySchedule.lunchStart,
      lunchEnd: daySchedule.lunchEnd,
      gapMinutes: daySchedule.gapMinutes,
    },
    STUDIO_SESSION_DURATION_MIN,
    [],
    [],
    new Date(`${dateStr}T12:00:00`),
    minStartTime,
    siteConfig.slotCapacity
  );

  const requestedMinutes = studioLocalMinutesFromUtc(scheduledAt);
  const matchingSlot = slots.find((slot) => {
    const [h, m] = slot.time.split(":").map(Number);
    return h * 60 + m === requestedMinutes;
  });

  if (!matchingSlot?.available) {
    throw new SlotBookingError("This time slot is not available", "SLOT_UNAVAILABLE");
  }
}

export function getDemoQuote() {
  return buildBookingQuote({
    serviceId: DEMO_REFORMER_SERVICE_ID,
    serviceName: REFORMER_SERVICE_NAME,
    servicePriceCents: DEMO_SERVICE_PRICE_CENTS,
    feePercentage: DEMO_FEE_PERCENTAGE,
    maxFeeCents: null,
    discountCents: 0,
    promotion: null,
  });
}

export function createDemoAppointment(params: {
  clientId: string;
  scheduledAt: Date;
}) {
  const quote = buildBookingQuote({
    serviceId: DEMO_REFORMER_SERVICE_ID,
    serviceName: REFORMER_SERVICE_NAME,
    servicePriceCents: DEMO_SERVICE_PRICE_CENTS,
    feePercentage: DEMO_FEE_PERCENTAGE,
    maxFeeCents: null,
    discountCents: 0,
    promotion: null,
  });

  return {
    id: randomUUID(),
    clientId: params.clientId,
    advisorId: DEMO_STUDIO_ADVISOR_ID,
    serviceId: DEMO_REFORMER_SERVICE_ID,
    scheduledAt: params.scheduledAt.toISOString(),
    durationMin: STUDIO_SESSION_DURATION_MIN,
    status: "CONFIRMED",
    totalCents: quote.totalCents,
    advisorEarning: quote.advisorEarningCents,
    platformFee: quote.platformFeeCents,
    discountCents: 0,
    isTest: true,
  };
}
