import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_REFORMER_SERVICE_ID,
  DEMO_STUDIO_INSTRUCTOR_ID,
  getDemoSlotsForDates,
  getDemoStudioResponse,
  isDemoBookingMode,
} from "@/lib/studio-demo-fallback";

describe("studio-demo-fallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enables demo mode for localhost DATABASE_URL", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://meti:meti@localhost:5432/meti_booking");
    expect(isDemoBookingMode()).toBe(true);
  });

  it("returns demo studio payload with instructor and services", () => {
    const studio = getDemoStudioResponse();
    expect(studio.studio.instructorId).toBe(DEMO_STUDIO_INSTRUCTOR_ID);
    expect(studio.studio.services[0]?.id).toBe(DEMO_REFORMER_SERVICE_ID);
    expect(studio.studio.schedule.length).toBeGreaterThan(0);
  });

  it("generates slots for active demo days", () => {
    vi.stubEnv("STUDIO_TIMEZONE", "Asia/Nicosia");
    vi.stubEnv("BOOKING_DEMO_FALLBACK", "1");

    const slots = getDemoSlotsForDates(["2099-06-02", "2099-06-04"]);
    expect(slots["2099-06-02"]?.length).toBeGreaterThan(0);
    expect(slots["2099-06-04"]?.length).toBeGreaterThan(0);
  });
});
