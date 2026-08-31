import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireSelfOrBootstrap } from "@/lib/session-auth";

export async function GET() {
  const adminCount = await prisma.adminProfile.count();
  return NextResponse.json({ hasAdmins: adminCount > 0 });
}

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const auth = await requireSelfOrBootstrap(
    userId,
    request.headers.get("x-admin-bootstrap-token")
  );
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const adminCount = await tx.adminProfile.count();
      if (adminCount > 0) {
        throw new Error("ADMIN_EXISTS");
      }

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      await tx.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
      });

      await tx.adminProfile.create({
        data: {
          userId,
          level: "SUPERADMIN",
        },
      });

      await tx.clientProfile.deleteMany({ where: { userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ADMIN_EXISTS") {
        return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
      }
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
