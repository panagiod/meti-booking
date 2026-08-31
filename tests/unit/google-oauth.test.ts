import { describe, it, expect, afterEach } from "vitest";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth";

describe("isGoogleOAuthConfigured", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("returns false when credentials are missing", () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    expect(isGoogleOAuthConfigured()).toBe(false);
  });

  it("returns false for demo placeholders", () => {
    process.env.GOOGLE_CLIENT_ID = "demo-google-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "demo-google-client-secret";
    expect(isGoogleOAuthConfigured()).toBe(false);
  });

  it("returns true for real-looking credentials", () => {
    process.env.GOOGLE_CLIENT_ID = "123456789-abc.apps.googleusercontent.com";
    process.env.GOOGLE_CLIENT_SECRET = "GOCSPX-real-secret";
    expect(isGoogleOAuthConfigured()).toBe(true);
  });
});
