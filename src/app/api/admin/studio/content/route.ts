import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getStudioContent, saveStudioContent } from "@/lib/studio-content-server";
import { StudioContentParseError } from "@/lib/studio-content-errors";
import { studioContentSchema } from "@/lib/studio-content-types";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const content = await getStudioContent({ strict: true });
    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof StudioContentParseError) {
      return NextResponse.json(
        {
          error:
            "Stored website content is invalid. Contact support before saving — raw data is preserved.",
        },
        { status: 500 }
      );
    }
    console.error("[admin/studio/content] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const content = studioContentSchema.parse(body.content);
    const saved = await saveStudioContent(content);

    return NextResponse.json({ content: saved });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.format() },
        { status: 400 }
      );
    }
    console.error("[admin/studio/content] PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
