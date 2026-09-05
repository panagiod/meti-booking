import { describe, expect, it } from "vitest";
import { isPublicPath } from "@/lib/public-routes";

describe("isPublicPath", () => {
  it("allows marketing and booking pages", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/book")).toBe(true);
    expect(isPublicPath("/cookies")).toBe(true);
    expect(isPublicPath("/refunds")).toBe(true);
    expect(isPublicPath("/faq")).toBe(true);
    expect(isPublicPath("/privacy")).toBe(true);
    expect(isPublicPath("/terms")).toBe(true);
    expect(isPublicPath("/resources")).toBe(true);
    expect(isPublicPath("/stories")).toBe(true);
    expect(isPublicPath("/booking/manage")).toBe(true);
    expect(isPublicPath("/blog")).toBe(true);
  });

  it("allows public APIs including appointment create and manage", () => {
    expect(isPublicPath("/api/studio")).toBe(true);
    expect(isPublicPath("/api/health")).toBe(true);
    expect(isPublicPath("/api/appointments")).toBe(true);
    expect(isPublicPath("/api/appointments/manage")).toBe(true);
    expect(isPublicPath("/api/auth/callback/google")).toBe(true);
  });

  it("does not treat dashboard or unknown APIs as public", () => {
    expect(isPublicPath("/dashboard")).toBe(false);
    expect(isPublicPath("/admin")).toBe(false);
    expect(isPublicPath("/api/advisors")).toBe(false);
    expect(isPublicPath("/api/client/appointments")).toBe(false);
  });
});
