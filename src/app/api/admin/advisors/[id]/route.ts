import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST: Approve/reject advisor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: advisorId } = await params;
    const { action } = await request.json();

    if (!["approve", "reject", "suspend"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const advisor = await prisma.advisorProfile.findUnique({
      where: { id: advisorId },
      include: { user: true },
    });

    if (!advisor) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Approve: activate advisor profile
      await prisma.advisorProfile.update({
        where: { id: advisorId },
        data: { isActive: true },
      });
      return NextResponse.json({ success: true, isActive: true });
    }

    if (action === "reject") {
      // Reject: change role to CLIENT and delete advisor profile
      await prisma.user.update({
        where: { id: advisor.userId },
        data: { role: "CLIENT" },
      });

      await prisma.advisorProfile.delete({
        where: { id: advisorId },
      });

      // Create ClientProfile if it does not exist
      const existingClient = await prisma.clientProfile.findUnique({
        where: { userId: advisor.userId },
      });

      if (!existingClient) {
        await prisma.clientProfile.create({
          data: { userId: advisor.userId },
        });
      }

      return NextResponse.json({ success: true, action: "rejected" });
    }

    if (action === "suspend") {
      // Suspend: deactivate advisor profile
      await prisma.advisorProfile.update({
        where: { id: advisorId },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, isActive: false });
    }
  } catch (error) {
    console.error("Error updating advisor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
