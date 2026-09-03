import { describe, expect, it } from "vitest";
import {
  googleCallbackUrl,
  homePathForRole,
  isSafeAuthNext,
  loginUrl,
  postAuthPath,
} from "@/lib/auth-redirect";

describe("auth-redirect", () => {
  it("accepts in-app paths and rejects open redirects", () => {
    expect(isSafeAuthNext("/dashboard/appointments")).toBe(true);
    expect(isSafeAuthNext("/checkout/result?appointmentId=1")).toBe(true);
    expect(isSafeAuthNext("https://evil.example/phish")).toBe(false);
    expect(isSafeAuthNext("//evil.example")).toBe(false);
    expect(isSafeAuthNext("/login")).toBe(false);
    expect(isSafeAuthNext("/redirect")).toBe(false);
    expect(isSafeAuthNext("/redirect?next=/dashboard")).toBe(false);
  });

  it("builds login and Google callback URLs from a safe next path", () => {
    expect(loginUrl("/dashboard/appointments")).toBe(
      "/login?next=%2Fdashboard%2Fappointments"
    );
    expect(loginUrl("/login")).toBe("/login");
    expect(googleCallbackUrl("/dashboard/appointments")).toBe(
      "/redirect?next=%2Fdashboard%2Fappointments"
    );
    expect(googleCallbackUrl(null)).toBe("/redirect");
  });

  it("prefers next over role home after auth", () => {
    expect(postAuthPath("ADMIN", "/dashboard/appointments")).toBe("/dashboard/appointments");
    expect(postAuthPath("ADMIN")).toBe("/admin");
    expect(postAuthPath("CLIENT")).toBe("/dashboard");
    expect(homePathForRole("ADVISOR")).toBe("/dashboard");
    expect(homePathForRole("INSTRUCTOR")).toBe("/dashboard");
    expect(homePathForRole("CLIENT")).toBe("/dashboard");
    expect(homePathForRole("ADMIN")).toBe("/admin");
  });
});
