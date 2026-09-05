import { describe, it, expect, vi, beforeEach } from "vitest";
import { findOrCreateGuestUser, GuestUserError } from "@/lib/guest-user";
import { UserRole } from "@/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    clientProfile: {
      upsert: vi.fn(),
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
    expect(prisma.clientProfile.upsert).not.toHaveBeenCalled();
  });

  it("saves a phone on an existing client", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "guest@example.com",
      name: "Guest",
      role: UserRole.CLIENT,
    } as never);
    vi.mocked(prisma.clientProfile.upsert).mockResolvedValue({} as never);

    await findOrCreateGuestUser("guest@example.com", "Guest", "+35795519786");

    expect(prisma.clientProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        update: { phone: "+35795519786" },
      })
    );
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
          client: { create: { phone: undefined } },
        }),
      })
    );
  });

  it("creates a client profile with a phone", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user",
      email: "new@example.com",
      name: "Alex",
    } as never);

    await findOrCreateGuestUser("new@example.com", "Alex", "+35795519786");

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          client: { create: { phone: "+35795519786" } },
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

  it("returns the existing client if create races on email", async () => {
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "user-2",
        email: "race@example.com",
        name: "Race",
        role: UserRole.CLIENT,
      } as never);
    vi.mocked(prisma.user.create).mockRejectedValue(new Error("Unique constraint"));

    const user = await findOrCreateGuestUser("race@example.com");
    expect(user.id).toBe("user-2");
  });
});
