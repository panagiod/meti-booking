export function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function requireBlobStorageInProduction(): void {
  if (process.env.NODE_ENV === "production" && !hasBlobStorage()) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required in production for persistent image uploads"
    );
  }
}
