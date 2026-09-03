import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

// GET: Video call chat message history
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { instructor: { select: { userId: true } } },
    });
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isParticipant =
      appointment.clientId === session.user.id ||
      appointment.instructor.userId === session.user.id;
    if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const messages = await prisma.chatMessage.findMany({
      where: { appointmentId },
      orderBy: { createdAt: "asc" },
      take: 500,
    });

    return NextResponse.json({
      messages: messages.map((m: { id: string; senderId: string; senderName: string; senderRole: string; body: string; createdAt: Date }) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const messageSchema = z.object({
  body: z.string().min(1).max(2000),
});

// POST: Persist a chat message
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
      include: { instructor: { select: { userId: true } } },
    });
    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isAdvisor = appointment.instructor.userId === session.user.id;
    const isClient = appointment.clientId === session.user.id;
    if (!isAdvisor && !isClient) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { body } = messageSchema.parse(await request.json());

    const message = await prisma.chatMessage.create({
      data: {
        appointmentId,
        senderId: session.user.id,
        senderName: session.user.name,
        senderRole: isAdvisor ? "advisor" : "client",
        body,
      },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    console.error("Error saving chat:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
