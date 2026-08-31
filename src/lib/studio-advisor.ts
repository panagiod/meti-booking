import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

export type StudioAdvisor = {
  id: string;
  user: { name: string; email: string };
};

/**
 * Resolves the primary studio instructor for customer booking and admin calendar.
 * Priority: STUDIO_ADVISOR_ID → pilates category → first verified active advisor.
 */
export async function resolveStudioAdvisor(): Promise<StudioAdvisor | null> {
  const envAdvisorId = process.env.STUDIO_ADVISOR_ID;

  let advisor = envAdvisorId
    ? await prisma.advisorProfile.findFirst({
        where: { id: envAdvisorId, isActive: true },
        select: {
          id: true,
          user: { select: { name: true, email: true } },
        },
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
        select: {
          id: true,
          user: { select: { name: true, email: true } },
        },
      });
    }
  }

  if (!advisor) {
    advisor = await prisma.advisorProfile.findFirst({
      where: { isActive: true, isVerified: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        user: { select: { name: true, email: true } },
      },
    });
  }

  return advisor;
}
