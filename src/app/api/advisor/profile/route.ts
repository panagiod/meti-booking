import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
  speciality: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  bookingLeadHours: z.number().int().min(0).max(168).optional(),
  isHidden: z.boolean().optional(),
  whatsappPhone: z.string().optional(),
});

// GET: Get profile
export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
        categories: {
          include: { category: true },
        },
      },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    // Get review stats
    const reviews = await prisma.review.findMany({
      where: {
        appointment: {
          advisorId: advisorProfile.id,
        },
      },
      select: { rating: true },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      profile: {
        id: advisorProfile.id,
        bio: advisorProfile.bio,
        speciality: advisorProfile.speciality,
        videoUrl: advisorProfile.videoUrl,
        isActive: advisorProfile.isActive,
        isHidden: advisorProfile.isHidden,
        isVerified: advisorProfile.isVerified,
        verificationStatus: advisorProfile.verificationStatus,
        createdAt: advisorProfile.createdAt,
        whatsappPhone: advisorProfile.whatsappPhone,
        user: advisorProfile.user,
        categories: advisorProfile.categories.map((ac: any) => ac.category),
      },
      stats: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update profile (incluyendo categorías)
export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisorProfile = await prisma.advisorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = profileSchema.parse(body);

    // Actualizar campos de User (name, image)
    const userUpdates: Record<string, string> = {};
    if (validatedData.name !== undefined) userUpdates.name = validatedData.name;
    if (validatedData.image !== undefined) userUpdates.image = validatedData.image || "";

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdates,
      });
    }

    // Actualizar perfil de asesor
    await prisma.advisorProfile.update({
      where: { id: advisorProfile.id },
      data: {
        ...(validatedData.bio !== undefined ? { bio: validatedData.bio || null } : {}),
        ...(validatedData.speciality !== undefined
          ? { speciality: validatedData.speciality || null }
          : {}),
        ...(validatedData.videoUrl !== undefined
          ? { videoUrl: validatedData.videoUrl || null }
          : {}),
        ...(validatedData.bookingLeadHours !== undefined
          ? { bookingLeadHours: validatedData.bookingLeadHours }
          : {}),
        ...(validatedData.isHidden !== undefined
          ? { isHidden: validatedData.isHidden }
          : {}),
        ...(validatedData.whatsappPhone !== undefined
          ? { whatsappPhone: validatedData.whatsappPhone || null }
          : {}),
      },
    });

    // Actualizar categorías si se enviaron
    if (body.categoryIds && Array.isArray(body.categoryIds)) {
      // Eliminar actuales y recrear
      await prisma.advisorCategory.deleteMany({
        where: { advisorId: advisorProfile.id },
      });
      if (body.categoryIds.length > 0) {
        await prisma.advisorCategory.createMany({
          data: body.categoryIds.map((categoryId: string) => ({
            advisorId: advisorProfile.id,
            categoryId,
          })),
        });
      }
    }

    // Retornar perfil actualizado con categorías y datos de usuario
    const updated = await prisma.advisorProfile.findUnique({
      where: { id: advisorProfile.id },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json({
      profile: {
        ...updated,
        categories: updated?.categories.map((ac: { category: unknown }) => ac.category) || [],
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
