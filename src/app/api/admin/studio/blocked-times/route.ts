import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveStudioInstructor } from "@/lib/studio-instructor";
import { blockedTimePayloadSchema } from "@/lib/schedule-schema";
import { parseStudioDateInput } from "@/lib/timezone";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioInstructor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const blockedTimes = await prisma.blockedTime.findMany({
      where: { instructorId: advisor.id },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ blockedTimes });
  } catch (error) {
    console.error("[admin/studio/blocked-times] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioInstructor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = blockedTimePayloadSchema.parse(body);

    const startDateOnly =
      typeof validatedData.startDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(validatedData.startDate);
    const endDateOnly =
      typeof validatedData.endDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(validatedData.endDate);

    const startDate = startDateOnly
      ? parseStudioDateInput(validatedData.startDate, false)
      : new Date(validatedData.startDate);
    const endDate = endDateOnly
      ? parseStudioDateInput(validatedData.endDate, true)
      : new Date(validatedData.endDate);

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    const overlapping = await prisma.blockedTime.findFirst({
      where: {
        instructorId: advisor.id,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "A block already exists for that time range" },
        { status: 400 }
      );
    }

    const blockedTime = await prisma.blockedTime.create({
      data: {
        instructorId: advisor.id,
        title: validatedData.title,
        startDate,
        endDate,
        isAllDay: validatedData.isAllDay,
        reason: validatedData.reason,
      },
    });

    return NextResponse.json({ blockedTime }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("[admin/studio/blocked-times] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const advisor = await resolveStudioInstructor();
    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const blockedTime = await prisma.blockedTime.findFirst({
      where: { id, instructorId: advisor.id },
    });

    if (!blockedTime) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.blockedTime.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/studio/blocked-times] DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
