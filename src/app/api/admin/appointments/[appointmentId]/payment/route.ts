import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  isPayableSessionStatus,
  normalizePaidByName,
} from "@/lib/session-payment";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  paid: z.boolean(),
  paidByName: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { appointmentId } = await params;
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        status: true,
        totalCents: true,
        paidAt: true,
        paidByName: true,
        paidRecordedByEmail: true,
        client: { select: { name: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (!isPayableSessionStatus(appointment.status)) {
      return NextResponse.json(
        { error: "Only completed or no-show sessions can be marked paid" },
        { status: 400 }
      );
    }

    const recordedBy = authResult.session.user.email ?? null;

    if (parsed.data.paid) {
      const paidByName =
        normalizePaidByName(parsed.data.paidByName) ??
        normalizePaidByName(appointment.client.name);
      if (!paidByName) {
        return NextResponse.json({ error: "Enter who paid" }, { status: 400 });
      }

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paidAt: appointment.paidAt ?? new Date(),
          paidByName,
          paidRecordedByEmail: recordedBy,
        },
        select: {
          id: true,
          paidAt: true,
          paidByName: true,
          paidRecordedByEmail: true,
          totalCents: true,
          status: true,
        },
      });

      return NextResponse.json({
        appointment: {
          id: updated.id,
          status: updated.status,
          totalCents: updated.totalCents,
          paidAt: updated.paidAt?.toISOString() ?? null,
          paidByName: updated.paidByName,
          paidRecordedByEmail: updated.paidRecordedByEmail,
        },
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paidAt: null,
        paidByName: null,
        paidRecordedByEmail: null,
      },
      select: {
        id: true,
        paidAt: true,
        paidByName: true,
        paidRecordedByEmail: true,
        totalCents: true,
        status: true,
      },
    });

    return NextResponse.json({
      appointment: {
        id: updated.id,
        status: updated.status,
        totalCents: updated.totalCents,
        paidAt: null,
        paidByName: updated.paidByName,
        paidRecordedByEmail: updated.paidRecordedByEmail,
      },
    });
  } catch (error) {
    console.error("[admin/appointments/payment] PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
