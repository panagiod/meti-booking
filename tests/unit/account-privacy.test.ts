import { describe, expect, it } from "vitest";
import {
  deleteAccountBlockReason,
  deletedEmailFor,
  isDeletedEmail,
} from "@/lib/account-privacy";

describe("account privacy helpers", () => {
  it("builds a unique deleted email", () => {
    expect(deletedEmailFor("abc123")).toBe("deleted-abc123@deleted.local");
    expect(isDeletedEmail("deleted-abc123@deleted.local")).toBe(true);
    expect(isDeletedEmail("client@demo.meti-booking.local")).toBe(false);
  });

  it("blocks studio staff and upcoming bookings", () => {
    expect(
      deleteAccountBlockReason({
        role: "ADMIN",
        upcomingCount: 0,
        isStudioAdmin: false,
      })
    ).toBe("not_client");
    expect(
      deleteAccountBlockReason({
        role: "CLIENT",
        upcomingCount: 0,
        isStudioAdmin: true,
      })
    ).toBe("not_client");
    expect(
      deleteAccountBlockReason({
        role: "CLIENT",
        upcomingCount: 2,
        isStudioAdmin: false,
      })
    ).toBe("upcoming");
    expect(
      deleteAccountBlockReason({
        role: "CLIENT",
        upcomingCount: 0,
        isStudioAdmin: false,
      })
    ).toBeNull();
  });
});
