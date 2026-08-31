import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PATCH: Update invoice status (mark as paid)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: body.status === "PAID" ? "PAID" : "PENDING",
        paidAt: body.status === "PAID" ? new Date() : null,
      },
    });

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
