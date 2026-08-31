import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST: Manual verification of document
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWithRole = session.user as any;
    if (userWithRole.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { documentId, action, reason } = await request.json();

    if (!documentId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get document
    const document = await prisma.advisorDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Update document
    await prisma.advisorDocument.update({
      where: { id: documentId },
      data: {
        manualStatus: action === "approve" ? "APPROVED" : "REJECTED",
        verifiedBy: session.user.id,
        verifiedAt: new Date(),
        rejectionReason: action === "reject" ? reason : null,
      },
    });

    // Check if all documents for this advisor are approved
    const advisorDocuments = await prisma.advisorDocument.findMany({
      where: { advisorId: document.advisorId },
    });

    const allApproved = advisorDocuments.every(
      (doc: any) => doc.manualStatus === "APPROVED" || doc.id === documentId
    );

    const hasRejected = advisorDocuments.some(
      (doc: any) => doc.manualStatus === "REJECTED" || (doc.id === documentId && action === "reject")
    );

    // Update advisor verification status
    let verificationStatus = "PENDING_MANUAL";
    let isVerified = false;

    if (hasRejected) {
      verificationStatus = "REJECTED";
    } else if (allApproved) {
      verificationStatus = "APPROVED";
      isVerified = true;
    }

    await prisma.advisorProfile.update({
      where: { id: document.advisorId },
      data: {
        verificationStatus,
        isVerified,
      },
    });

    return NextResponse.json({
      success: true,
      verificationStatus,
      isVerified,
    });
  } catch (error) {
    console.error("Error verifying document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
