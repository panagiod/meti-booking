import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSelfOrBootstrap } from "@/lib/session-auth";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const auth = await requireSelfOrBootstrap(userId, null);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.clientProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting up client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
