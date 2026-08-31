import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Registrar usuario como cliente
export async function POST(request: NextRequest) {
  const { userId } = await request.json();

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

    // Verificar que ya tenga ClientProfile (se crea en el hook)
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId },
    });

    if (!clientProfile) {
      // Crear ClientProfile si no existe
      await prisma.clientProfile.create({
        data: {
          userId: userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error setting up client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
