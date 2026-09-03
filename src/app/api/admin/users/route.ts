import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { containsInsensitive } from "@/lib/prisma-filters";
import { requireAdminSession } from "@/lib/admin-auth";

// GET: List all users
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: any = {};

    if (role && role !== "all") {
      where.role = role.toUpperCase();
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
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.toLowerCase(),
        appointments: u._count.appointments,
        joinDate: u.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
