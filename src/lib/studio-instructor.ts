import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

export type StudioInstructor = {
  id: string;
  user: { name: string; email: string };
};

/**
 * Resolves the primary studio instructor for customer booking and admin calendar.
 * Priority: STUDIO_INSTRUCTOR_ID / STUDIO_ADVISOR_ID → pilates category → first verified active instructor.
 */
export async function resolveStudioInstructor(): Promise<StudioInstructor | null> {
  const envInstructorId = process.env.STUDIO_INSTRUCTOR_ID || process.env.STUDIO_ADVISOR_ID;

  let instructor = envInstructorId
    ? await prisma.instructorProfile.findFirst({
        where: { id: envInstructorId, isActive: true },
        select: {
          id: true,
          user: { select: { name: true, email: true } },
        },
      })
    : null;

  if (!instructor) {
    const pilatesCategory = await prisma.category.findUnique({
      where: { slug: siteConfig.studioCategorySlug },
    });

    if (pilatesCategory) {
      instructor = await prisma.instructorProfile.findFirst({
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

  if (!instructor) {
    instructor = await prisma.instructorProfile.findFirst({
      where: { isActive: true, isVerified: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        user: { select: { name: true, email: true } },
      },
    });
  }

  return instructor;
}

/** True when this instructor is the studio's primary teacher (schedule owned by admin). */
export async function isStudioInstructor(instructorId: string): Promise<boolean> {
  const studio = await resolveStudioInstructor();
  return studio?.id === instructorId;
}

/** Accepts instructorId, with advisorId as a short-lived alias from older clients. */
export function readInstructorId(
  source: { get(name: string): string | null } | Record<string, unknown> | null | undefined
): string | null {
  if (!source) return null;
  if (typeof (source as { get?: unknown }).get === "function") {
    const params = source as { get(name: string): string | null };
    return params.get("instructorId") || params.get("advisorId");
  }
  const obj = source as Record<string, unknown>;
  const value = obj.instructorId ?? obj.advisorId;
  return typeof value === "string" && value.length > 0 ? value : null;
}
