import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PATCH: Update promotion
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const advisorProfile = await prisma.advisorProfile.findUnique({ where: { userId: session.user.id } });
    if (!advisorProfile) return NextResponse.json({ error: "Advisor not found" }, { status: 404 });

    const existing = await prisma.promotion.findFirst({ where: { id, advisorId: advisorProfile.id } });
    if (!existing) return NextResponse.json({ error: "Promotion not found" }, { status: 404 });

    const body = await request.json();
    const data: Record<string, any> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.discountType !== undefined) data.discountType = body.discountType;
    if (body.discountValue !== undefined) data.discountValue = body.discountValue;
    if (body.startAt !== undefined) data.startAt = new Date(body.startAt);
    if (body.endAt !== undefined) data.endAt = new Date(body.endAt);
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const promotion = await prisma.promotion.update({ where: { id }, data });
    return NextResponse.json({ promotion });
  } catch (error) {
    console.error("Error updating promotion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete promotion
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const advisorProfile = await prisma.advisorProfile.findUnique({ where: { userId: session.user.id } });
    if (!advisorProfile) return NextResponse.json({ error: "Advisor not found" }, { status: 404 });

    const existing = await prisma.promotion.findFirst({ where: { id, advisorId: advisorProfile.id } });
    if (!existing) return NextResponse.json({ error: "Promotion not found" }, { status: 404 });

    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
