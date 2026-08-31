import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { DEFAULT_BOOKING_LEAD_HOURS } from "@/lib/booking-config";

// POST: Request to become an advisor
export async function POST() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Verify the user is a client
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "ADVISOR") {
      return NextResponse.json({ error: "Already an advisor" }, { status: 400 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Admins cannot become advisors" }, { status: 400 });
    }

    // Verify they do not already have a pending advisor profile
    const existingAdvisor = await prisma.advisorProfile.findUnique({
      where: { userId },
    });

    if (existingAdvisor) {
      return NextResponse.json({ error: "Already have an advisor profile" }, { status: 400 });
    }

    // Create pending advisor profile
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADVISOR" },
    });

    await prisma.advisorProfile.create({
      data: {
        userId: userId,
        isActive: false, // Pending approval
        bookingLeadHours: DEFAULT_BOOKING_LEAD_HOURS,
      },
    });

    // Delete ClientProfile
    await prisma.clientProfile.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Your request has been submitted. An administrator will review your profile.",
    });
  } catch (error) {
    console.error("Error requesting advisor role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
