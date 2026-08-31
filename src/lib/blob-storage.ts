export function hasBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** VPS / Docker deploys use a persistent volume instead of Vercel Blob. */
export function allowsLocalUploads(): boolean {
  return process.env.SELF_HOSTED === "1" || process.env.LOCAL_FILE_UPLOADS === "1";
}

export function requireBlobStorageInProduction(): void {
  if (
    process.env.NODE_ENV === "production" &&
    !hasBlobStorage() &&
    !allowsLocalUploads()
  ) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required in production for persistent image uploads (or set SELF_HOSTED=1 on VPS)"
    );
  }
}
