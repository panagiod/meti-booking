import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { completePastAppointments } from "@/lib/appointment-complete-server";
import { retainedAppointmentWhere } from "@/lib/appointment-complete";

// GET: List client appointments
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

    await completePastAppointments();

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: userId,
        ...retainedAppointmentWhere(),
      },
      include: {
        instructor: {
          include: { user: true },
        },
        service: true,
        review: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
