import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Check if any admins exist
export async function GET() {
  const adminCount = await prisma.adminProfile.count();
  return NextResponse.json({ hasAdmins: adminCount > 0 });
}

// POST: Register user as admin
export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // Verify no admins exist yet
    const adminCount = await prisma.adminProfile.count();
    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 400 }
      );
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update role and create AdminProfile
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    });

    await prisma.adminProfile.create({
      data: {
        userId: userId,
        level: "SUPERADMIN",
      },
    });

    // Delete ClientProfile if it exists
    await prisma.clientProfile.deleteMany({
      where: { userId: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
