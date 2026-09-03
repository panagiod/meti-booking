import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export class AdminPromoteError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminPromoteError";
    this.status = status;
  }
}

/** Constant-time compare against ADMIN_PROMOTE_TOKEN. False if unset. */
export function isAdminPromoteTokenValid(provided: string | null | undefined): boolean {
  const expected = process.env.ADMIN_PROMOTE_TOKEN;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Promotes an existing user to ADMIN. The user must have signed in at least
 * once (e.g. via Google) so their row already exists.
 */
export async function promoteUserToAdmin(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    throw new AdminPromoteError(
      "No user found for that email. Sign in at least once first.",
      404
    );
  }

  const previousRole = user.role;

  await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, level: "SUPERADMIN" },
    update: { level: "SUPERADMIN" },
  });
  await prisma.advisorProfile.deleteMany({ where: { userId: user.id } });
  await prisma.clientProfile.deleteMany({ where: { userId: user.id } });
  await prisma.session.deleteMany({ where: { userId: user.id } });

  return { email: normalizedEmail, previousRole, role: "ADMIN" as const };
}
