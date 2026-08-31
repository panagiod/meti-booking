import { describe, it, expect, afterEach, vi } from "vitest";
import {
  hasBlobStorage,
  allowsLocalUploads,
  requireBlobStorageInProduction,
} from "@/lib/blob-storage";

describe("blob-storage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects blob token", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "token");
    expect(hasBlobStorage()).toBe(true);
  });

  it("allows local uploads when SELF_HOSTED=1", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SELF_HOSTED", "1");
    expect(allowsLocalUploads()).toBe(true);
    expect(() => requireBlobStorageInProduction()).not.toThrow();
  });

  it("requires blob or self-hosted in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("SELF_HOSTED", "");
    vi.stubEnv("LOCAL_FILE_UPLOADS", "");
    expect(() => requireBlobStorageInProduction()).toThrow();
  });
});
