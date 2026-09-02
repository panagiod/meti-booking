import { afterEach, describe, expect, it, vi } from "vitest";
import { isPaymentsEnabled, isPaymentsEnabledClient } from "@/lib/payments-config";

describe("payments-config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is disabled by default", () => {
    vi.stubEnv("PAYMENTS_ENABLED", "");
    vi.stubEnv("NEXT_PUBLIC_PAYMENTS_ENABLED", "");
    expect(isPaymentsEnabled()).toBe(false);
    expect(isPaymentsEnabledClient()).toBe(false);
  });

  it("enables when env is 1 or true", () => {
    vi.stubEnv("PAYMENTS_ENABLED", "1");
    expect(isPaymentsEnabled()).toBe(true);
    vi.stubEnv("PAYMENTS_ENABLED", "true");
    expect(isPaymentsEnabled()).toBe(true);
  });
});
