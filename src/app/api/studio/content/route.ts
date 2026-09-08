import { NextResponse } from "next/server";
import { getStudioContent, studioBranding } from "@/lib/studio-content-server";
import { getStudioCancelHours } from "@/lib/cancel-hours-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [content, cancelHours] = await Promise.all([
      getStudioContent(),
      getStudioCancelHours(),
    ]);
    return NextResponse.json({
      branding: {
        ...studioBranding(content),
        cancelHours,
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
