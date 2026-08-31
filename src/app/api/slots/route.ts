import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";
import { APP_TIMEZONE_OFFSET_HOURS } from "@/lib/timezone";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const advisorId = searchParams.get("advisorId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!advisorId || !serviceId || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: advisorId, serviceId, date" },
      { status: 400 }
    );
  }

  try {
    // Auto-expire PENDING appointments older than 15 minutes for this advisor
    // This frees slots without relying on a frequent cron (Hobby plan limitation)
    const expiryThreshold = new Date(Date.now() - 15 * 60 * 1000);
    await prisma.appointment.updateMany({
      where: {
        advisorId,
        status: "PENDING",
        createdAt: { lt: expiryThreshold },
      },
      data: {
        status: "CANCELLED",
        cancelReason: "Pago no completado - expirado después de 15 minutos",
        cancelledAt: new Date(),
      },
    });

    // Get advisor schedule for the requested date
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();

    const schedule = await prisma.advisorSchedule.findUnique({
      where: {
        advisorId_dayOfWeek: {
          advisorId,
          dayOfWeek,
        },
      },
    });

    if (!schedule || !schedule.isActive) {
      return NextResponse.json({ slots: [] });
    }

    // Get service duration
    const service = await prisma.advisorService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Anticipación mínima definida por el asesor (bookingLeadHours)
    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { id: advisorId },
      select: { bookingLeadHours: true },
    });
    const minStartTime =
      advisorProfile && advisorProfile.bookingLeadHours > 0
        ? new Date(Date.now() + advisorProfile.bookingLeadHours * 60 * 60 * 1000)
        : undefined;

    // Get existing appointments for that date (en timezone de la app, Colombia UTC-5)
    const [y, m, d] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(y, m - 1, d, -APP_TIMEZONE_OFFSET_HOURS, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(y, m - 1, d, 23 - APP_TIMEZONE_OFFSET_HOURS, 59, 59, 999));

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        advisorId,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["CONFIRMED", "IN_PROGRESS", "PENDING"],
        },
      },
      select: {
        scheduledAt: true,
        durationMin: true,
      },
    });

    // Convert to format needed for slot generation
    const appointments = existingAppointments.map((apt: { scheduledAt: Date; durationMin: number }) => ({
      start: apt.scheduledAt,
      end: new Date(apt.scheduledAt.getTime() + apt.durationMin * 60 * 1000),
    }));

    // Generate available slots
    const scheduleData = {
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      lunchStart: schedule.lunchStart,
      lunchEnd: schedule.lunchEnd,
      gapMinutes: schedule.gapMinutes,
    };

    const slots = generateAvailableSlots(scheduleData, service.durationMin, appointments, [], undefined, minStartTime);

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
