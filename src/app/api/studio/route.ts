import { NextResponse } from "next/server";
import { resolveStudioAdvisor } from "@/lib/studio-advisor";
import { getStudioContent } from "@/lib/studio-content-server";
import { getDemoStudioResponse, isDemoBookingMode } from "@/lib/studio-demo-fallback";
import { isPaymentsEnabled } from "@/lib/payments-config";

/**
 * Returns the primary studio instructor used for customer booking at /book.
 */
export async function GET() {
  if (isDemoBookingMode()) {
    return NextResponse.json({
      ...getDemoStudioResponse(),
      paymentsEnabled: isPaymentsEnabled(),
    });
  }

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
      paymentsEnabled: isPaymentsEnabled(),
    });
  } catch (error) {
    console.error("[studio] GET error:", error);
    if (isDemoBookingMode()) {
      return NextResponse.json({
        ...getDemoStudioResponse(),
        paymentsEnabled: isPaymentsEnabled(),
      });
    }
    return NextResponse.json({ error: "Failed to load studio" }, { status: 500 });
  }
}
