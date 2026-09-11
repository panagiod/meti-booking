import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { containsInsensitive } from "@/lib/prisma-filters";
import { requireAdminSession } from "@/lib/admin-auth";
import { partitionAdminAppointments, type AdminUserAppointment } from "@/lib/admin-users";
import { retainedAppointmentWhere } from "@/lib/appointment-complete";
import { completePastAppointments } from "@/lib/appointment-complete-server";
import { unpaidSessionTotalCents } from "@/lib/session-payment";
import {
  attendanceCutoffDateStr,
  richerYearAttendance,
  summarizeYearAttendance,
  yearAttendanceFromAppointments,
} from "@/lib/client-attendance";

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
    totalCents: number;
    paidAt: Date | null;
    paidByName: string | null;
    paidRecordedByEmail: string | null;
    service: { name: string };
  }>;
};

async function loadAttendanceByClient(): Promise<Map<string, Array<{ studioDate: string }>>> {
  const byClient = new Map<string, Array<{ studioDate: string }>>();
  try {
    const rows = await prisma.clientAttendance.findMany({
      select: { clientId: true, studioDate: true },
    });
    for (const row of rows) {
      const list = byClient.get(row.clientId);
      if (list) list.push({ studioDate: row.studioDate });
      else byClient.set(row.clientId, [{ studioDate: row.studioDate }]);
    }
  } catch (error) {
    console.error("client_attendance unavailable", error);
  }
  return byClient;
}

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

    try {
      await completePastAppointments();
    } catch (error) {
      console.error("Could not complete past appointments before listing users", error);
    }

    const [users, attendanceByClient] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          client: { select: { phone: true } },
          appointments: {
            where: retainedAppointmentWhere(),
            select: {
              id: true,
              scheduledAt: true,
              status: true,
              durationMin: true,
              isTest: true,
              totalCents: true,
              paidAt: true,
              paidByName: true,
              paidRecordedByEmail: true,
              service: { select: { name: true } },
            },
            orderBy: { scheduledAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      loadAttendanceByClient(),
    ]);

    const cutoff = attendanceCutoffDateStr();

    return NextResponse.json({
      users: (users as UserRow[]).map((user) => {
        const appointments: AdminUserAppointment[] = user.appointments.map((appointment) => ({
          id: appointment.id,
          scheduledAt: appointment.scheduledAt.toISOString(),
          status: appointment.status,
          serviceName: appointment.service.name,
          durationMin: appointment.durationMin,
          isTest: appointment.isTest,
          totalCents: appointment.totalCents,
          paidAt: appointment.paidAt ? appointment.paidAt.toISOString() : null,
          paidByName: appointment.paidByName,
          paidRecordedByEmail: appointment.paidRecordedByEmail,
        }));
        const { upcoming, recent } = partitionAdminAppointments(appointments);
        const year = richerYearAttendance(
          summarizeYearAttendance(attendanceByClient.get(user.id) ?? [], cutoff),
          yearAttendanceFromAppointments(appointments, cutoff)
        );
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
          yearCount: year.count,
          yearDates: year.dates,
          unpaidCents: unpaidSessionTotalCents(appointments),
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
