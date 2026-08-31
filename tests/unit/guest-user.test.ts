import { describe, it, expect, vi, beforeEach } from "vitest";
import { findOrCreateGuestUser, GuestUserError } from "@/lib/guest-user";
import { UserRole } from "@/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

describe("findOrCreateGuestUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing client user by email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "guest@example.com",
      name: "Guest",
      role: UserRole.CLIENT,
    } as never);

    const user = await findOrCreateGuestUser("  Guest@Example.com  ");

    expect(user.id).toBe("user-1");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("creates a new client when email is unknown", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user",
      email: "new@example.com",
      name: "Alex",
    } as never);

    const user = await findOrCreateGuestUser("new@example.com", "Alex");

    expect(user.id).toBe("new-user");
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "new@example.com",
          name: "Alex",
          role: UserRole.CLIENT,
        }),
      })
    );
  });

  it("rejects non-client existing accounts", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin",
      role: UserRole.ADMIN,
    } as never);

    await expect(findOrCreateGuestUser("admin@example.com")).rejects.toThrow(GuestUserError);
  });
});
