import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";
import { APP_TIMEZONE_OFFSET_HOURS } from "@/lib/timezone";
import { siteConfig } from "@/lib/site-config";
import { capWeeklyScheduleRows } from "@/lib/studio-schedule";

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
        cancelReason: "Payment not completed - expired after 15 minutes",
        cancelledAt: new Date(),
      },
    });

    // Get advisor schedule for the requested date
    const requestDate = new Date(date);
    const dayOfWeek = requestDate.getDay();

    const allSchedules = await prisma.advisorSchedule.findMany({
      where: { advisorId, isActive: true },
      orderBy: { dayOfWeek: "asc" },
    });

    const allowedDaySet = new Set(
      capWeeklyScheduleRows(allSchedules).map((s) => s.dayOfWeek)
    );
    const daySchedule =
      allowedDaySet.has(dayOfWeek)
        ? allSchedules.find((s: (typeof allSchedules)[number]) => s.dayOfWeek === dayOfWeek)
        : undefined;

    if (!daySchedule) {
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

    // Minimum lead time defined by the advisor (bookingLeadHours)
    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { id: advisorId },
      select: { bookingLeadHours: true },
    });
    const minStartTime =
      advisorProfile && advisorProfile.bookingLeadHours > 0
        ? new Date(Date.now() + advisorProfile.bookingLeadHours * 60 * 60 * 1000)
        : undefined;

    // Get existing appointments for that date (in app timezone, Colombia UTC-5)
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

    const blockedTimesRaw = await prisma.blockedTime.findMany({
      where: {
        advisorId,
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
    });

    const blockedTimes = blockedTimesRaw.map(
      (bt: { startDate: Date; endDate: Date; isAllDay: boolean }) => ({
        startDate: bt.startDate,
        endDate: bt.endDate,
        isAllDay: bt.isAllDay,
      })
    );

    // Convert to format needed for slot generation
    const appointments = existingAppointments.map((apt: { scheduledAt: Date; durationMin: number }) => ({
      start: apt.scheduledAt,
      end: new Date(apt.scheduledAt.getTime() + apt.durationMin * 60 * 1000),
    }));

    // Generate available slots
    const scheduleData = {
      dayOfWeek: daySchedule.dayOfWeek,
      startTime: daySchedule.startTime,
      endTime: daySchedule.endTime,
      lunchStart: daySchedule.lunchStart,
      lunchEnd: daySchedule.lunchEnd,
      gapMinutes: daySchedule.gapMinutes,
    };

    const slots = generateAvailableSlots(
      scheduleData,
      service.durationMin,
      appointments,
      blockedTimes,
      requestDate,
      minStartTime,
      siteConfig.slotCapacity
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
