import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST: Solicitar ser asesor
export async function POST() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Verificar que el usuario sea cliente
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "ADVISOR") {
      return NextResponse.json({ error: "Already an advisor" }, { status: 400 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Admins cannot become advisors" }, { status: 400 });
    }

    // Verificar que no tenga ya un perfil de asesor pendiente
    const existingAdvisor = await prisma.advisorProfile.findUnique({
      where: { userId },
    });

    if (existingAdvisor) {
      return NextResponse.json({ error: "Already have an advisor profile" }, { status: 400 });
    }

    // Crear perfil de asesor pendiente
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADVISOR" },
    });

    await prisma.advisorProfile.create({
      data: {
        userId: userId,
        isActive: false, // Pendiente de aprobación
      },
    });

    // Eliminar ClientProfile
    await prisma.clientProfile.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Tu solicitud ha sido enviada. El administrador revisará tu perfil.",
    });
  } catch (error) {
    console.error("Error requesting advisor role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
