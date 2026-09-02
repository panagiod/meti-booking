import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAuthBaseURL,
  getClientAuthBaseURL,
  getTrustedAuthOrigins,
} from "@/lib/auth-config";

describe("auth-config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses BETTER_AUTH_URL when it is a public URL", () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://meti-pilates.com");
    expect(getAuthBaseURL()).toBe("https://meti-pilates.com");
  });

  it("prefers VERCEL_URL over localhost BETTER_AUTH_URL", () => {
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_URL", "temporary-spry-sienna-anqfej8.vercel.app");
    expect(getAuthBaseURL()).toBe("https://temporary-spry-sienna-anqfej8.vercel.app");
  });

  it("includes Vercel deployment origins in trusted origins", () => {
    vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubEnv("VERCEL_URL", "temporary-spry-sienna-anqfej8.vercel.app");
    expect(getTrustedAuthOrigins()).toContain(
      "https://temporary-spry-sienna-anqfej8.vercel.app"
    );
  });

  it("prefers browser origin over localhost NEXT_PUBLIC on the client", () => {
    vi.stubEnv("NEXT_PUBLIC_BETTER_AUTH_URL", "http://localhost:3000");
    vi.stubGlobal("window", {
      location: { origin: "https://temporary-spry-sienna-anqfej8.vercel.app" },
    } as Window & typeof globalThis);

    expect(getClientAuthBaseURL()).toBe("https://temporary-spry-sienna-anqfej8.vercel.app");
  });
});
