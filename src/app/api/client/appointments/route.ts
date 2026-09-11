import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { retainedAppointmentWhere } from "@/lib/appointment-complete";
import { completePastAppointments } from "@/lib/appointment-complete-server";
import { toClientAppointment } from "@/lib/client-appointments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
      await completePastAppointments();
    } catch (error) {
      console.error("Could not complete past appointments before listing client bookings", error);
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: userId,
        ...retainedAppointmentWhere(),
      },
      select: {
        id: true,
        scheduledAt: true,
        durationMin: true,
        status: true,
        totalCents: true,
        paidAt: true,
        service: { select: { name: true, rescheduleHoursMin: true } },
        instructor: { select: { user: { select: { name: true, image: true } } } },
        review: { select: { id: true, rating: true, comment: true } },
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({
      appointments: appointments.map((appointment: (typeof appointments)[number]) =>
        toClientAppointment(appointment)
      ),
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
