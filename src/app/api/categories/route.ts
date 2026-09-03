import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

// GET: Public category list for this studio (pilates only)
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, slug: siteConfig.studioCategorySlug },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
