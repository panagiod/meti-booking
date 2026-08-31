import { NextRequest, NextResponse } from "next/server";
import { getSlotsForDate } from "@/lib/slots-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const advisorId = searchParams.get("advisorId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!advisorId || !serviceId || !date) {
    return NextResponse.json(
      { error: "Missing required parameters: advisorId, serviceId, date" },
      { status: 400 }
    );
  }

  try {
    const slots = await getSlotsForDate(advisorId, serviceId, date);
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
