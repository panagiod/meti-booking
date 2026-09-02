import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_REFORMER_SERVICE_ID,
  DEMO_STUDIO_ADVISOR_ID,
  getDemoAdvisorResponse,
  getDemoSlotsForDates,
  getDemoStudioResponse,
  isDemoBookingMode,
} from "@/lib/studio-demo-fallback";

describe("studio-demo-fallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enables demo mode without DATABASE_URL", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(isDemoBookingMode()).toBe(true);
  });

  it("returns demo studio and advisor payloads", () => {
    const studio = getDemoStudioResponse();
    expect(studio.studio.advisorId).toBe(DEMO_STUDIO_ADVISOR_ID);

    const advisor = getDemoAdvisorResponse();
    expect(advisor.advisor.services[0]?.id).toBe(DEMO_REFORMER_SERVICE_ID);
    expect(advisor.advisor.schedule.length).toBeGreaterThan(0);
  });

  it("generates slots for active demo days", () => {
    vi.stubEnv("STUDIO_TIMEZONE", "Europe/Athens");
    vi.stubEnv("BOOKING_DEMO_FALLBACK", "1");

    const slots = getDemoSlotsForDates(["2099-06-02", "2099-06-04"]);
    expect(slots["2099-06-02"]?.length).toBeGreaterThan(0);
    expect(slots["2099-06-04"]?.length).toBeGreaterThan(0);
  });
});
