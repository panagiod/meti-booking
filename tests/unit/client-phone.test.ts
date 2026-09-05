import { describe, expect, it } from "vitest";
import { ClientPhoneError, normalizeClientPhone } from "@/lib/client-phone";

describe("normalizeClientPhone", () => {
  it("treats empty values as omitted", () => {
    expect(normalizeClientPhone("")).toBeNull();
    expect(normalizeClientPhone("   ")).toBeNull();
    expect(normalizeClientPhone(undefined)).toBeNull();
  });

  it("keeps a Cyprus mobile in +E.164 form", () => {
    expect(normalizeClientPhone("+357 95 519786")).toBe("+35795519786");
  });

  it("keeps local digits when there is no plus", () => {
    expect(normalizeClientPhone("95 519 786")).toBe("95519786");
  });

  it("rejects numbers that are too short or too long", () => {
    expect(() => normalizeClientPhone("12345")).toThrow(ClientPhoneError);
    expect(() => normalizeClientPhone("+1234567890123456")).toThrow(ClientPhoneError);
  });
});
