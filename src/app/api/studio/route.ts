import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveStudioAdvisor } from "@/lib/studio-advisor";
import { getStudioContent } from "@/lib/studio-content-server";

/**
 * Returns the primary studio instructor used for customer booking at /book.
 */
export async function GET() {
  try {
    const [advisor, content] = await Promise.all([resolveStudioAdvisor(), getStudioContent()]);

    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    return NextResponse.json({
      studio: {
        advisorId: advisor.id,
        name: content.name,
      },
    });
  } catch (error) {
    console.error("[studio] GET error:", error);
    return NextResponse.json({ error: "Failed to load studio" }, { status: 500 });
  }
}
