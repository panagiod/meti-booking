import { NextResponse } from "next/server";
import { getStudioContent, studioBranding, localeContentFromStudio } from "@/lib/studio-content-server";

export async function GET() {
  try {
    const content = await getStudioContent();
    return NextResponse.json({
      branding: studioBranding(content),
      contentEn: content.contentEn,
      contentEl: content.contentEl,
    });
  } catch (error) {
    console.error("[studio/content] GET error:", error);
    return NextResponse.json({ error: "Failed to load studio content" }, { status: 500 });
  }
}
