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

export type GuestCheckoutUser = {
  id: string;
  email: string;
  name: string;
  /** False when this email already had a client account. */
  created: boolean;
};

/**
 * The browser may receive a manage token only for a newly created guest.
 * An existing client's confirmation link goes to their inbox, not the response.
 */
export function guestMayReceiveManageToken(created: boolean): boolean {
  return created;
}

export async function findOrCreateGuestUser(
  email: string,
  name?: string | null,
  phone?: string | null
): Promise<GuestCheckoutUser> {
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
    return { id: existing.id, email: existing.email, name: existing.name, created: false };
  }

  const displayName = name?.trim() || normalizedEmail.split("@")[0] || "Guest";

  try {
    const created = await prisma.user.create({
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
    return { ...created, created: true };
  } catch {
    const raced = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, role: true },
    });
    if (raced?.role === UserRole.CLIENT) {
      return { id: raced.id, email: raced.email, name: raced.name, created: false };
    }
    throw new GuestUserError(
      "An account with this email already exists. Please sign in to continue."
    );
  }
}
