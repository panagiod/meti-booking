import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Registrar usuario como asesor
export async function POST(request: NextRequest) {
  const { userId, bio, categoryIds } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    // Verificar que el usuario exista
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verificar que no sea ya asesor
    const existingAdvisor = await prisma.advisorProfile.findUnique({
      where: { userId },
    });

    if (existingAdvisor) {
      return NextResponse.json({ error: "Already an advisor" }, { status: 400 });
    }

    // Actualizar rol
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADVISOR" },
    });

    // Crear perfil de asesor
    const advisorProfile = await prisma.advisorProfile.create({
      data: {
        userId: userId,
        bio: bio || null,
        isActive: false, // Pendiente de aprobación
      },
    });

    // Asociar categorías
    if (categoryIds && categoryIds.length > 0) {
      await prisma.advisorCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          advisorId: advisorProfile.id,
          categoryId,
        })),
      });
    }

    // Eliminar ClientProfile si existe
    await prisma.clientProfile.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Tu solicitud ha sido enviada. El administrador revisará tu perfil.",
    });
  } catch (error) {
    console.error("Error creating advisor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
