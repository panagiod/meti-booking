import { NextRequest, NextResponse } from "next/server";
import { getSlotsForDate } from "@/lib/slots-server";
import { readInstructorId } from "@/lib/studio-instructor";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const instructorId = readInstructorId(searchParams);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!instructorId || !serviceId || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: instructorId, serviceId, date" },
      { status: 400 }
    );
  }

  try {
    const slots = await getSlotsForDate(instructorId, serviceId, date);
    return NextResponse.json(
      { slots },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "SERVICE_NOT_FOUND") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
