import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { decryptMpAccessToken, encryptMpAccessToken, advisorMpConnected } from "@/lib/advisor-mp";

// GET: Get MercadoPago credentials + mode
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
      select: {
        mpMode: true,
        mpPublicKey: true,
        mpAccessToken: true,
      },
    });

    if (!advisorProfile) {
      return NextResponse.json({ error: "Advisor profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      mpMode: advisorProfile.mpMode,
      publicKey: advisorProfile.mpPublicKey || null,
      accessToken: advisorProfile.mpAccessToken ? "••••••••••••••••" : null,
      isConnected: advisorMpConnected(advisorProfile),
    });
  } catch (error) {
    console.error("Error fetching MP credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Save MercadoPago credentials or switch mode
export async function POST(request: NextRequest) {
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

    // Mode switch (no credentials update)
    if (body.mpMode && !body.publicKey && !body.accessToken) {
      if (!["TEST", "PRODUCTION"].includes(body.mpMode)) {
        return NextResponse.json(
          { error: "mpMode must be TEST or PRODUCTION" },
          { status: 400 }
        );
      }

      // When switching to PRODUCTION: delete all test appointments
      let deletedTestCount = 0;
      if (body.mpMode === "PRODUCTION" && advisorProfile.mpMode === "TEST") {
        const testAppointments = await prisma.appointment.findMany({
          where: {
            advisorId: advisorProfile.id,
            isTest: true,
          },
          select: { id: true },
        });

        if (testAppointments.length > 0) {
          const testIds = testAppointments.map((a: { id: string }) => a.id);
          await prisma.appointment.deleteMany({
            where: {
              id: { in: testIds },
            },
          });
          deletedTestCount = testAppointments.length;
        }
      }

      await prisma.advisorProfile.update({
        where: { id: advisorProfile.id },
        data: { mpMode: body.mpMode },
      });

      return NextResponse.json({
        success: true,
        mpMode: body.mpMode,
        deletedTestCount,
      });
    }

    // Credentials update
    const { publicKey, accessToken, mpMode } = body;

    if (!publicKey || !accessToken) {
      return NextResponse.json(
        { error: "Public Key and Access Token are required" },
        { status: 400 }
      );
    }

    // Validate format
    if (!publicKey.startsWith("APP_USR-")) {
      return NextResponse.json(
        { error: "Invalid Public Key. It must start with APP_USR-" },
        { status: 400 }
      );
    }

    if (!accessToken.startsWith("APP_USR-")) {
      return NextResponse.json(
        { error: "Invalid Access Token. It must start with APP_USR-" },
        { status: 400 }
      );
    }

    await prisma.advisorProfile.update({
      where: { id: advisorProfile.id },
      data: {
        mpPublicKey: publicKey,
        mpAccessToken: encryptMpAccessToken(accessToken),
        ...(mpMode ? { mpMode } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving MP credentials:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
