import { NextRequest, NextResponse } from "next/server";
import { parseSlotDates } from "@/lib/slot-dates";
import { getSlotsForDates } from "@/lib/slots-server";
import { readInstructorId } from "@/lib/studio-instructor";
import {
  getDemoSlotsForDates,
  isDemoInstructorId,
  isDemoBookingMode,
  isDemoServiceId,
} from "@/lib/studio-demo-fallback";

export const dynamic = "force-dynamic";

const MAX_BATCH_DATES = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const instructorId = readInstructorId(searchParams);
  const serviceId = searchParams.get("serviceId");
  const dates = parseSlotDates(searchParams.get("dates"));

  if (!instructorId || !serviceId) {
    return NextResponse.json(
      { error: "Missing required parameters: instructorId, serviceId" },
      { status: 400 }
    );
  }

  if (dates.length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid dates parameter (comma-separated YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  if (dates.length > MAX_BATCH_DATES) {
    return NextResponse.json(
      { error: `Too many dates requested (max ${MAX_BATCH_DATES})` },
      { status: 400 }
    );
  }

  try {
    if (isDemoBookingMode() && isDemoInstructorId(instructorId) && isDemoServiceId(serviceId)) {
      const slotsByDate = getDemoSlotsForDates(dates);
      return NextResponse.json(
        { slotsByDate },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const slotsByDate = await getSlotsForDates(instructorId, serviceId, dates);
    return NextResponse.json(
      { slotsByDate },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "SERVICE_NOT_FOUND") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    console.error("Error fetching batch slots:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
