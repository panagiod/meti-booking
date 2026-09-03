import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET: List invoices (with month and status filter)
// Query: ?month=YYYY-MM&status=PENDING|PAID
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const month = request.nextUrl.searchParams.get("month");
    const status = request.nextUrl.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status === "PENDING" || status === "PAID") where.status = status;
    if (month) {
      const [y, m] = month.split("-").map(Number);
      where.periodStart = { gte: new Date(Date.UTC(y, m - 1, 1)) };
      where.periodEnd = { lte: new Date(Date.UTC(y, m, 0, 23, 59, 59)) };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        instructor: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: [{ periodStart: "desc" }, { createdAt: "desc" }],
    });

    // Statistics
    const totals = await prisma.invoice.aggregate({
      where: month ? where : undefined,
      _sum: { totalFeeCents: true },
      _count: true,
    });

    return NextResponse.json({
      invoices: invoices.map((inv: any) => ({
        id: inv.id,
        advisorName: inv.instructor.user.name,
        advisorEmail: inv.instructor.user.email,
        periodStart: inv.periodStart.toISOString(),
        periodEnd: inv.periodEnd.toISOString(),
        totalFeeCents: inv.totalFeeCents,
        totalEarningsCents: inv.totalEarningsCents,
        appointmentCount: inv.appointmentCount,
        status: inv.status,
        paidAt: inv.paidAt?.toISOString() || null,
      })),
      stats: {
        totalPendingFeeCents: totals._sum.totalFeeCents || 0,
        invoiceCount: totals._count,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
