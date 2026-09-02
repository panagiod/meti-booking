import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import {
  canAdvisorCancelAppointment,
  canClientCancelAppointment,
} from "@/lib/appointment-cancel";

// GET: Get appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        advisor: {
          include: { user: true },
        },
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify user is part of this appointment
    const userId = session.user.id;
    const isAdvisor = appointment.advisor.userId === userId;
    const isClient = appointment.clientId === userId;

    if (!isAdvisor && !isClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

// PATCH: Cancel a booking (client or advisor) and free the slot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const body = await request.json();
    const { reason } = cancelSchema.parse(body);

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        advisor: { include: { user: true } },
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Verify user is part of this appointment
    const userId = session.user.id;
    const isAdvisor = appointment.advisor.userId === userId;
    const isClient = appointment.clientId === userId;
    const isAdmin = (session.user as { role?: string }).role === "ADMIN";

    if (!isAdvisor && !isClient && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cancelCheck = isClient && !isAdmin
      ? canClientCancelAppointment({
          status: appointment.status,
          scheduledAt: appointment.scheduledAt,
          rescheduleHoursMin: appointment.service.rescheduleHoursMin,
        })
      : canAdvisorCancelAppointment(appointment.status)
        ? { allowed: true as const }
        : { allowed: false as const, reason: "This appointment cannot be cancelled." };

    if (!cancelCheck.allowed) {
      return NextResponse.json({ error: cancelCheck.reason }, { status: 400 });
    }

    // Cancel the appointment and free the slot
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "CANCELLED",
        cancelReason: reason || (isAdmin ? "Cancelled by admin" : isClient ? "Cancelled by client" : "Cancelled by advisor"),
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, cancelled: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
