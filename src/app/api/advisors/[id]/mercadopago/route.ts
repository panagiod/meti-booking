import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { advisorMpConnected } from "@/lib/advisor-mp";

// GET: Check if advisor has MercadoPago configured
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const advisor = await prisma.advisorProfile.findUnique({
      where: { id },
      select: {
        mpMode: true,
        mpPublicKey: true,
        mpAccessToken: true,
      },
    });

    if (!advisor) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    const isConnected = advisorMpConnected(advisor);

    return NextResponse.json({ isConnected, mpMode: advisor.mpMode });
  } catch (error) {
    console.error("Error checking MP status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
