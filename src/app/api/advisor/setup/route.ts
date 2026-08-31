import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Register user as advisor
export async function POST(request: NextRequest) {
  const { userId, bio, categoryIds } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify they are not already an advisor
    const existingAdvisor = await prisma.advisorProfile.findUnique({
      where: { userId },
    });

    if (existingAdvisor) {
      return NextResponse.json({ error: "Already an advisor" }, { status: 400 });
    }

    // Update role
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADVISOR" },
    });

    // Create advisor profile
    const advisorProfile = await prisma.advisorProfile.create({
      data: {
        userId: userId,
        bio: bio || null,
        isActive: false, // Pending approval
      },
    });

    // Associate categories
    if (categoryIds && categoryIds.length > 0) {
      await prisma.advisorCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          advisorId: advisorProfile.id,
          categoryId,
        })),
      });
    }

    // Delete ClientProfile if it exists
    await prisma.clientProfile.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Your request has been submitted. An administrator will review your profile.",
    });
  } catch (error) {
    console.error("Error creating advisor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
