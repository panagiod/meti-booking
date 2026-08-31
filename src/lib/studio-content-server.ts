import { prisma } from "@/lib/prisma";
import {
  STUDIO_CONTENT_ID,
  buildDefaultStudioContent,
  localeContentFromStudio,
  studioBranding,
} from "@/lib/studio-content";
import { studioContentSchema, type StudioContentData } from "@/lib/studio-content-types";

function parseStudioContent(data: unknown): StudioContentData {
  return studioContentSchema.parse(data);
}

export async function getStudioContent(): Promise<StudioContentData> {
  const row = await prisma.studioContent.findUnique({
    where: { id: STUDIO_CONTENT_ID },
  });

  if (!row) {
    return buildDefaultStudioContent();
  }

  try {
    return parseStudioContent(row.data);
  } catch {
    return buildDefaultStudioContent();
  }
}

export async function saveStudioContent(data: StudioContentData): Promise<StudioContentData> {
  const validated = parseStudioContent(data);

  await prisma.studioContent.upsert({
    where: { id: STUDIO_CONTENT_ID },
    create: {
      id: STUDIO_CONTENT_ID,
      data: validated,
    },
    update: {
      data: validated,
    },
  });

  return validated;
}

export async function ensureStudioContentSeed(): Promise<void> {
  const existing = await prisma.studioContent.findUnique({
    where: { id: STUDIO_CONTENT_ID },
  });

  if (!existing) {
    await prisma.studioContent.create({
      data: {
        id: STUDIO_CONTENT_ID,
        data: buildDefaultStudioContent(),
      },
    });
  }
}

export { localeContentFromStudio, studioBranding };
