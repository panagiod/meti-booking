import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

/**
 * Returns the primary studio instructor used for customer booking at /book.
 * Priority: STUDIO_ADVISOR_ID env → first verified advisor in pilates category → first active advisor.
 */
export async function GET() {
  try {
    const envAdvisorId = process.env.STUDIO_ADVISOR_ID;

    let advisor = envAdvisorId
      ? await prisma.advisorProfile.findFirst({
          where: { id: envAdvisorId, isActive: true },
          select: { id: true },
        })
      : null;

    if (!advisor) {
      const pilatesCategory = await prisma.category.findUnique({
        where: { slug: siteConfig.studioCategorySlug },
      });

      if (pilatesCategory) {
        advisor = await prisma.advisorProfile.findFirst({
          where: {
            isActive: true,
            isVerified: true,
            categories: { some: { categoryId: pilatesCategory.id } },
          },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
      }
    }

    if (!advisor) {
      advisor = await prisma.advisorProfile.findFirst({
        where: { isActive: true, isVerified: true },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
    }

    if (!advisor) {
      return NextResponse.json({ error: "No studio instructor configured" }, { status: 404 });
    }

    return NextResponse.json({
      studio: {
        advisorId: advisor.id,
        name: siteConfig.name,
      },
    });
  } catch (error) {
    console.error("[studio] GET error:", error);
    return NextResponse.json({ error: "Failed to load studio" }, { status: 500 });
  }
}
