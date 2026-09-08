import { NextResponse } from "next/server";
import { getStudioContent, studioBranding } from "@/lib/studio-content-server";
import { getStudioBookingSettings } from "@/lib/studio-booking-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [content, bookingSettings] = await Promise.all([
      getStudioContent(),
      getStudioBookingSettings(),
    ]);
    return NextResponse.json({
      branding: {
        ...studioBranding(content),
        cancelHours: bookingSettings.cancelHours,
        slotCapacity: bookingSettings.slotCapacity,
        bookingWeeksAhead: bookingSettings.bookingWeeksAhead,
        location: content.location,
        locationEl: content.locationEl,
      },
      contentEn: content.contentEn,
      contentEl: content.contentEl,
    });
  } catch (error) {
    console.error("[studio/content] GET error:", error);
    return NextResponse.json({ error: "Failed to load studio content" }, { status: 500 });
  }
}
