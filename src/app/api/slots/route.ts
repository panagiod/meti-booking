import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/slots";
import { getDayOfWeekForStudioDate, studioDayBoundsUTC } from "@/lib/timezone";
import { siteConfig } from "@/lib/site-config";
import { resolveBookingLeadHours } from "@/lib/booking-config";

export const dynamic = "force-dynamic";

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
    const dayOfWeek = getDayOfWeekForStudioDate(date);

    const daySchedule = await prisma.advisorSchedule.findUnique({
      where: {
        advisorId_dayOfWeek: {
          advisorId,
          dayOfWeek,
        },
      },
    });

    if (!daySchedule || !daySchedule.isActive) {
      return NextResponse.json({ slots: [] });
    }

    const service = await prisma.advisorService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { id: advisorId },
      select: { bookingLeadHours: true },
    });

    const leadHours = resolveBookingLeadHours(advisorProfile?.bookingLeadHours);
    const minStartTime =
      leadHours > 0 ? new Date(Date.now() + leadHours * 60 * 60 * 1000) : undefined;

    const { start: startOfDay, end: endOfDay } = studioDayBoundsUTC(date);

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

    const appointments = existingAppointments.map((apt: { scheduledAt: Date; durationMin: number }) => ({
      start: apt.scheduledAt,
      end: new Date(apt.scheduledAt.getTime() + apt.durationMin * 60 * 1000),
    }));

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
      new Date(`${date}T12:00:00`),
      minStartTime,
      siteConfig.slotCapacity
    );

    return NextResponse.json(
      { slots },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
