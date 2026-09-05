import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { containsInsensitive } from "@/lib/prisma-filters";
import { requireAdminSession } from "@/lib/admin-auth";
import { partitionAdminAppointments, type AdminUserAppointment } from "@/lib/admin-users";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  client: { phone: string | null } | null;
  appointments: Array<{
    id: string;
    scheduledAt: Date;
    status: string;
    durationMin: number;
    isTest: boolean;
    service: { name: string };
  }>;
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: {
      role?: "ADMIN" | "CLIENT" | "INSTRUCTOR";
      OR?: Array<Record<string, unknown>>;
    } = {};

    if (role && role !== "all") {
      const normalized = role.toUpperCase();
      if (normalized === "ADMIN" || normalized === "CLIENT" || normalized === "INSTRUCTOR") {
        where.role = normalized;
      }
    }

    if (search) {
      where.OR = [
        { name: containsInsensitive(search) },
        { email: containsInsensitive(search) },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        client: { select: { phone: true } },
        appointments: {
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            durationMin: true,
            isTest: true,
            service: { select: { name: true } },
          },
          orderBy: { scheduledAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: (users as UserRow[]).map((user) => {
        const appointments: AdminUserAppointment[] = user.appointments.map((appointment) => ({
          id: appointment.id,
          scheduledAt: appointment.scheduledAt.toISOString(),
          status: appointment.status,
          serviceName: appointment.service.name,
          durationMin: appointment.durationMin,
          isTest: appointment.isTest,
        }));
        const { upcoming, recent } = partitionAdminAppointments(appointments);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
          phone: user.client?.phone ?? null,
          appointments: appointments.filter((item) => !item.isTest).length,
          joinDate: user.createdAt.toISOString(),
          upcoming,
          recent,
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
