export const DELETED_ACCOUNT_NAME = "Deleted account";

export function deletedEmailFor(userId: string): string {
  return `deleted-${userId}@deleted.local`;
}

export function isDeletedEmail(email: string): boolean {
  return /^deleted-[a-z0-9]+@deleted\.local$/i.test(email);
}

export type DeleteBlockReason = "not_client" | "upcoming";

export function deleteAccountBlockReason(input: {
  role: string;
  upcomingCount: number;
  isStudioAdmin: boolean;
}): DeleteBlockReason | null {
  if (input.role !== "CLIENT" || input.isStudioAdmin) return "not_client";
  if (input.upcomingCount > 0) return "upcoming";
  return null;
}

export const OPEN_BOOKING_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS"] as const;
