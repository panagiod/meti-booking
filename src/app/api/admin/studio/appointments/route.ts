import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import { isAutomatedTestEmail } from "@/lib/appointment-cancel";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SLOT_HOLDING_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS"] as const;
const RANGE_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"] as const;

const freeSlotsSchema = z.object({
  scope: z.enum(["upcoming", "test"]).default("upcoming"),
});

function mapAppointment(apt: {
  id: string;
  scheduledAt: Date;
  status: string;
  durationMin: number;
  service: { name: string };
  client: { name: string; email: string };
}) {
  return {
    id: apt.id,
    scheduledAt: apt.scheduledAt.toISOString(),
    status: apt.status,
    durationMin: apt.durationMin,
    serviceName: apt.service.name,
    clientName: apt.client.name,
    clientEmail: apt.client.email,
    isTestBooking: isAutomatedTestEmail(apt.client.email),
  };
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioInstructor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const startDate = request.nextUrl.searchParams.get("startDate");
    const endDate = request.nextUrl.searchParams.get("endDate");
    const ranged = Boolean(startDate && endDate);

    const appointments = await prisma.appointment.findMany({
      where: {
        instructorId: advisor.id,
        status: { in: ranged ? [...RANGE_STATUSES] : [...SLOT_HOLDING_STATUSES] },
        scheduledAt: ranged
          ? { gte: new Date(startDate!), lte: new Date(endDate!) }
          : { gte: new Date() },
      },
      include: {
        client: { select: { name: true, email: true } },
        service: { select: { name: true, durationMin: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({
      upcomingCount: appointments.filter((apt: (typeof appointments)[number]) =>
        SLOT_HOLDING_STATUSES.includes(apt.status as (typeof SLOT_HOLDING_STATUSES)[number])
      ).length,
      appointments: appointments.map((apt: (typeof appointments)[number]) => mapAppointment(apt)),
    });
  } catch (error) {
    console.error("[admin/studio/appointments] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioInstructor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { scope } = freeSlotsSchema.parse(body);

    const holding = await prisma.appointment.findMany({
      where: {
        instructorId: advisor.id,
        status: { in: [...SLOT_HOLDING_STATUSES] },
        scheduledAt: { gte: new Date() },
      },
      include: { client: { select: { email: true } } },
    });

    const toCancel =
      scope === "test"
        ? holding.filter((apt: (typeof holding)[number]) => isAutomatedTestEmail(apt.client.email))
        : holding;

    if (toCancel.length === 0) {
      return NextResponse.json({ cancelled: 0, ids: [] });
    }

    const ids = toCancel.map((apt: (typeof toCancel)[number]) => apt.id);
    await prisma.appointment.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "CANCELLED",
        cancelReason: scope === "test" ? "Cancelled test bookings" : "Cancelled by admin — slots freed",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json({ cancelled: ids.length, ids });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.format() }, { status: 400 });
    }
    console.error("[admin/studio/appointments] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
