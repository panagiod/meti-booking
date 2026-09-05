export class ClientPhoneError extends Error {
  constructor(message = "Enter a valid phone number") {
    super(message);
    this.name = "ClientPhoneError";
  }
}

/** Empty is allowed. Otherwise require 8–15 digits (Cyprus or international). */
export function normalizeClientPhone(
  value: string | null | undefined
): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    throw new ClientPhoneError();
  }

  return trimmed.startsWith("+") ? `+${digits}` : digits;
}
