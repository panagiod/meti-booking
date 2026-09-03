import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import {
  createManageToken,
  parseManageToken,
  verifyManageToken,
  MANAGE_TOKEN_TTL_MS,
} from "@/lib/booking-manage-token";

describe("booking manage token", () => {
  beforeEach(() => {
    vi.stubEnv("BETTER_AUTH_SECRET", "test-manage-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("round-trips a valid token bound to email", () => {
    const token = createManageToken("apt_123", "Guest@Example.com");
    const parsed = parseManageToken(token);
    expect(parsed?.appointmentId).toBe("apt_123");
    expect(verifyManageToken(token, "guest@example.com")).toBe(true);
    expect(verifyManageToken(token, "other@example.com")).toBe(false);
  });

  it("rejects expired and malformed tokens", () => {
    const expired = createManageToken("apt_123", "a@b.com", Date.now() - MANAGE_TOKEN_TTL_MS - 1000);
    expect(parseManageToken(expired)).toBeNull();
    expect(verifyManageToken(expired, "a@b.com")).toBe(false);
    expect(parseManageToken("not-a-token")).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const token = createManageToken("apt_123", "a@b.com");
    const parts = token.split(".");
    parts[2] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    expect(verifyManageToken(parts.join("."), "a@b.com")).toBe(false);
  });
});
