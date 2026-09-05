import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";

export async function saveClientPhone(
  userId: string,
  phone: string | null
): Promise<void> {
  await prisma.clientProfile.upsert({
    where: { userId },
    update: { phone },
    create: { userId, phone },
  });
}

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
  name?: string | null,
  phone?: string | null
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
    if (phone) {
      await saveClientPhone(existing.id, phone);
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
          create: { phone: phone ?? undefined },
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
      if (phone) {
        await saveClientPhone(raced.id, phone);
      }
      return raced;
    }
    throw new GuestUserError(
      "An account with this email already exists. Please sign in to continue."
    );
  }
}
