import { prisma } from "@/lib/prisma";
import { isStudioAdminEmail } from "@/lib/studio-admins";
import {
  DELETED_ACCOUNT_NAME,
  deleteAccountBlockReason,
  deletedEmailFor,
  OPEN_BOOKING_STATUSES,
} from "@/lib/account-privacy";

export async function exportClientAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      client: { select: { phone: true } },
      appointments: {
        orderBy: { scheduledAt: "desc" },
        select: {
          id: true,
          scheduledAt: true,
          durationMin: true,
          status: true,
          totalCents: true,
          service: { select: { name: true } },
        },
      },
    },
  });

  if (!user) return null;

  return {
    exportedAt: new Date().toISOString(),
    person: {
      name: user.name,
      email: user.email,
      phone: user.client?.phone ?? null,
      createdAt: user.createdAt.toISOString(),
    },
    bookings: user.appointments.map((appointment) => ({
      id: appointment.id,
      service: appointment.service.name,
      scheduledAt: appointment.scheduledAt.toISOString(),
      durationMin: appointment.durationMin,
      status: appointment.status,
      totalCents: appointment.totalCents,
    })),
  };
}

export async function eraseClientAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });
  if (!user) {
    return { ok: false as const, status: 404 as const, reason: "not_found" as const };
  }

  const upcomingCount = await prisma.appointment.count({
    where: {
      clientId: userId,
      status: { in: [...OPEN_BOOKING_STATUSES] },
      scheduledAt: { gte: new Date() },
    },
  });

  const block = deleteAccountBlockReason({
    role: user.role,
    upcomingCount,
    isStudioAdmin: isStudioAdminEmail(user.email),
  });
  if (block) {
    return {
      ok: false as const,
      status: block === "upcoming" ? (409 as const) : (403 as const),
      reason: block,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.clientProfile.updateMany({ where: { userId }, data: { phone: null } });
    await tx.user.update({
      where: { id: userId },
      data: {
        name: DELETED_ACCOUNT_NAME,
        email: deletedEmailFor(userId),
        image: null,
        emailVerified: false,
      },
    });
  });

  return { ok: true as const };
}
