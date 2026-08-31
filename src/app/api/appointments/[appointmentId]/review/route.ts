import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// POST: Crear reseña de una asesoría completada (solo el cliente)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Solo el cliente de la cita puede reseñar
    if (appointment.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Solo citas completadas
    if (appointment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Solo puedes reseñar asesorías completadas" },
        { status: 400 }
      );
    }

    const { rating, comment } = reviewSchema.parse(await request.json());

    // Una sola reseña por cita — permitir actualizar si ya existe
    const existing = await prisma.review.findUnique({
      where: { appointmentId },
    });
    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating,
          comment: comment || null,
        },
      });
      return NextResponse.json({ review: updated, updated: true });
    }

    const review = await prisma.review.create({
      data: {
        appointmentId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
