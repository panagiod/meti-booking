import { resolveStudioAdvisor } from "@/lib/studio-advisor";

/** True when this advisor is the studio's primary instructor (schedule owned by admin). */
export async function isStudioInstructor(advisorId: string): Promise<boolean> {
  const studio = await resolveStudioAdvisor();
  return studio?.id === advisorId;
}
