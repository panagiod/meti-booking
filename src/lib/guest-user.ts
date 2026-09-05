import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";

export class GuestUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuestUserError";
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findOrCreateGuestUser(
  email: string,
  name?: string | null
): Promise<{ id: string; email: string; name: string }> {
  const normalizedEmail = normalizeEmail(email);

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, name: true, role: true },
  });

  if (existing) {
    if (existing.role !== UserRole.CLIENT) {
      throw new GuestUserError(
        "An account with this email already exists. Please sign in to continue."
      );
    }
    return existing;
  }

  const displayName = name?.trim() || normalizedEmail.split("@")[0] || "Guest";

  try {
    return await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: displayName,
        role: UserRole.CLIENT,
        emailVerified: false,
        client: {
          create: {},
        },
      },
      select: { id: true, email: true, name: true },
    });
  } catch {
    const raced = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, role: true },
    });
    if (raced?.role === UserRole.CLIENT) {
      return raced;
    }
    throw new GuestUserError(
      "An account with this email already exists. Please sign in to continue."
    );
  }
}
