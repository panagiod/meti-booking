import { describe, expect, it } from "vitest";
import { isKeptStudioClientName } from "@/lib/keep-studio-client";

describe("isKeptStudioClientName", () => {
  it("keeps Γεωργία Δημητρίου with or without accents", () => {
    expect(isKeptStudioClientName("Γεωργία Δημητρίου")).toBe(true);
    expect(isKeptStudioClientName("Γεωργια Δημητριου")).toBe(true);
    expect(isKeptStudioClientName("  Γεωργία   Δημητρίου ")).toBe(true);
  });

  it("does not keep other clients", () => {
    expect(isKeptStudioClientName("Test User")).toBe(false);
    expect(isKeptStudioClientName("Γεωργία")).toBe(false);
    expect(isKeptStudioClientName("")).toBe(false);
  });
});
