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
 * Make this user an admin without revoking their current session.
 * Used when a studio owner is already logged in and needs /admin.
 */
export async function ensureStudioOwnerAdmin(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return null;

  const previousRole = user.role;
  if (previousRole !== "ADMIN") {
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  }
  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, level: "SUPERADMIN" },
    update: { level: "SUPERADMIN" },
  });
  // Keep InstructorProfile if this is also the studio instructor.
  await prisma.clientProfile.deleteMany({ where: { userId: user.id } });

  return { email: normalizedEmail, previousRole, role: "ADMIN" as const, userId: user.id };
}

/**
 * Promotes an existing user to ADMIN. The user must have signed in at least
 * once (e.g. via Google) so their row already exists.
 */
export async function promoteUserToAdmin(email: string) {
  const result = await ensureStudioOwnerAdmin(email);
  if (!result) {
    throw new AdminPromoteError(
      "No user found for that email. Sign in at least once first.",
      404
    );
  }

  await prisma.session.deleteMany({ where: { userId: result.userId } });
  return { email: result.email, previousRole: result.previousRole, role: result.role };
}
