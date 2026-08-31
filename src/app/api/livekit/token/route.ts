import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateToken, generateRoomName } from "@/lib/livekit";

// POST: Generate LiveKit token for a room
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID required" },
        { status: 400 }
      );
    }

    // Get appointment with related data
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        advisor: {
          include: { user: true },
        },
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify user is part of this appointment
    const userId = session.user.id;
    const isAdvisor = appointment.advisor.userId === userId;
    const isClient = appointment.clientId === userId;

    if (!isAdvisor && !isClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate room name
    const roomName = generateRoomName(appointmentId);

    // Generate token for the user
    const token = await generateToken(
      roomName,
      isAdvisor ? appointment.advisor.user.name : appointment.client.name,
      userId,
      {
        role: isAdvisor ? "advisor" : "client",
        appointmentId,
        service: appointment.service.name,
      }
    );

    return NextResponse.json({
      token,
      roomName,
      url: process.env.LIVEKIT_URL || "wss://meti-cognilab.livekit.cloud",
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
