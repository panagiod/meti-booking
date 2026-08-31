import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  decryptSecret,
  encryptSecret,
  isEncryptedSecret,
} from "@/lib/encryption";
import { decryptMpAccessToken, encryptMpAccessToken } from "@/lib/advisor-mp";

describe("encryption", () => {
  const originalKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.ENCRYPTION_KEY;
    } else {
      process.env.ENCRYPTION_KEY = originalKey;
    }
  });

  it("round-trips plaintext with dev key", () => {
    const encrypted = encryptSecret("secret-token-123");
    expect(isEncryptedSecret(encrypted)).toBe(true);
    expect(decryptSecret(encrypted)).toBe("secret-token-123");
  });

  it("returns plaintext when value is not encrypted", () => {
    expect(decryptSecret("APP_USR-plain-token")).toBe("APP_USR-plain-token");
    expect(isEncryptedSecret("APP_USR-plain-token")).toBe(false);
  });

  it("uses ENCRYPTION_KEY when set", () => {
    process.env.ENCRYPTION_KEY = "test-production-key";
    const encrypted = encryptSecret("mp-token");
    process.env.ENCRYPTION_KEY = "different-key";
    expect(() => decryptSecret(encrypted)).toThrow();
  });
});

describe("advisor-mp", () => {
  it("encrypts and decrypts MP access tokens", () => {
    const token = "APP_USR-test-access-token";
    const stored = encryptMpAccessToken(token);
    expect(stored).not.toBe(token);
    expect(decryptMpAccessToken(stored)).toBe(token);
  });

  it("decrypts legacy plaintext tokens", () => {
    const token = "APP_USR-legacy-token";
    expect(decryptMpAccessToken(token)).toBe(token);
  });
});
