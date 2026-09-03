import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseManageToken, verifyManageToken } from "@/lib/booking-manage-token";
import { canClientCancelAppointment } from "@/lib/appointment-cancel";
import { notifyAppointmentCancelled } from "@/lib/notify";
import { siteConfig } from "@/lib/site-config";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function loadManagedAppointment(token: string) {
  const parsed = parseManageToken(token);
  if (!parsed) return { error: jsonError("Invalid or expired booking link", 401) };

  const appointment = await prisma.appointment.findUnique({
    where: { id: parsed.appointmentId },
    include: {
      client: { select: { id: true, email: true, name: true } },
      instructor: { include: { user: { select: { name: true } } } },
      service: { select: { name: true, rescheduleHoursMin: true } },
    },
  });
  if (!appointment) return { error: jsonError("Booking not found", 404) };
  if (!verifyManageToken(token, appointment.client.email)) {
    return { error: jsonError("Invalid or expired booking link", 401) };
  }

  return { appointment };
}

function cancelCheck(appointment: {
  status: Parameters<typeof canClientCancelAppointment>[0]["status"];
  scheduledAt: Date;
  service: { rescheduleHoursMin: number };
}) {
  return canClientCancelAppointment({
    status: appointment.status,
    scheduledAt: appointment.scheduledAt,
    rescheduleHoursMin: appointment.service.rescheduleHoursMin,
  });
}

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get("t") ?? "";
    const result = await loadManagedAppointment(token);
    if ("error" in result) return result.error;

    const { appointment } = result;
    const check = cancelCheck(appointment);
    return NextResponse.json({
      appointment: {
        id: appointment.id,
        scheduledAt: appointment.scheduledAt.toISOString(),
        durationMin: appointment.durationMin,
        status: appointment.status,
        totalCents: appointment.totalCents,
        currency: siteConfig.currency,
        serviceName: appointment.service.name,
        instructorName: appointment.instructor.user.name,
        clientEmail: appointment.client.email,
        clientName: appointment.client.name,
        cancellable: check.allowed,
        cancelReason: check.reason ?? null,
      },
    });
  } catch (error) {
    console.error("Manage booking GET failed", error);
    return jsonError("Failed to load booking", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { token?: string };
    const token = body.token?.trim() ?? "";
    const result = await loadManagedAppointment(token);
    if ("error" in result) return result.error;

    const { appointment } = result;
    const check = cancelCheck(appointment);
    if (!check.allowed) {
      return jsonError(check.reason ?? "This booking cannot be cancelled", 400);
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: "CANCELLED",
        cancelReason: "Cancelled via booking link",
        cancelledAt: new Date(),
      },
    });

    try {
      await notifyAppointmentCancelled(appointment.id, { cancelledBy: "client" });
    } catch (notifyError) {
      console.error("Error sending cancellation emails:", notifyError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manage booking cancel failed", error);
    return jsonError("Failed to cancel booking", 500);
  }
}
