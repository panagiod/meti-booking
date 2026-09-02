import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveStudioAdvisor } from "@/lib/studio-advisor";
import { isAutomatedTestEmail } from "@/lib/appointment-cancel";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SLOT_HOLDING_STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS"] as const;

const freeSlotsSchema = z.object({
  scope: z.enum(["upcoming", "test"]).default("upcoming"),
});

export async function GET() {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioAdvisor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        advisorId: advisor.id,
        status: { in: [...SLOT_HOLDING_STATUSES] },
        scheduledAt: { gte: new Date() },
      },
      include: {
        client: { select: { name: true, email: true } },
        service: { select: { name: true, durationMin: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({
      upcomingCount: appointments.length,
      appointments: appointments.map((apt: (typeof appointments)[number]) => ({
        id: apt.id,
        scheduledAt: apt.scheduledAt.toISOString(),
        status: apt.status,
        durationMin: apt.durationMin,
        serviceName: apt.service.name,
        clientName: apt.client.name,
        clientEmail: apt.client.email,
        isTestBooking: isAutomatedTestEmail(apt.client.email),
      })),
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

    const advisor = await resolveStudioAdvisor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { scope } = freeSlotsSchema.parse(body);

    const holding = await prisma.appointment.findMany({
      where: {
        advisorId: advisor.id,
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
