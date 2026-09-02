import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { containsInsensitive } from "@/lib/prisma-filters";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET: List all advisors
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWithRole = session.user as any;
    if (userWithRole.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "all") {
      where.isActive = status === "active";
    }

    if (search) {
      where.OR = [
        { user: { name: containsInsensitive(search) } },
        { user: { email: containsInsensitive(search) } },
        { speciality: containsInsensitive(search) },
      ];
    }

    const advisors = await prisma.advisorProfile.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true, image: true, createdAt: true },
        },
        services: { select: { id: true } },
        appointments: {
          where: { status: "COMPLETED" },
          select: { id: true, advisorEarning: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      advisors: advisors.map((a: any) => ({
        id: a.id,
        name: a.user.name,
        email: a.user.email,
        speciality: a.speciality || "Unspecified",
        status: a.isActive ? "active" : "pending",
        services: a.services.length,
        appointments: a.appointments.length,
        earnings: a.appointments.reduce(
          (sum: number, apt: any) => sum + apt.advisorEarning,
          0
        ),
        joinDate: a.user.createdAt.toISOString(),
        mpMode: a.mpMode,
        whatsappPhone: a.whatsappPhone,
      })),
    });
  } catch (error) {
    console.error("Error fetching advisors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
