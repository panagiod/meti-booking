import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function requestFor(path: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  return new NextRequest(new URL(`https://meti-pilates.com${path}`), { headers });
}

describe("proxy", () => {
  it("lets public pages through without a session", () => {
    const res = proxy(requestFor("/cookies"));
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("returns JSON 401 for unknown APIs instead of a login redirect", () => {
    const res = proxy(requestFor("/api/advisors"));
    expect(res.status).toBe(401);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects protected pages to login", () => {
    const res = proxy(requestFor("/dashboard/appointments"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });
});
