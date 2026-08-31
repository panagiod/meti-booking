import { prisma } from "@/lib/prisma";
import {
  STUDIO_CONTENT_ID,
  buildDefaultStudioContent,
  localeContentFromStudio,
  studioBranding,
} from "@/lib/studio-content";
import { studioContentSchema, type StudioContentData } from "@/lib/studio-content-types";
import { StudioContentParseError } from "@/lib/studio-content-errors";

function parseStudioContent(data: unknown): StudioContentData {
  return studioContentSchema.parse(data);
}

export async function getStudioContent(options?: {
  strict?: boolean;
}): Promise<StudioContentData> {
  const row = await prisma.studioContent.findUnique({
    where: { id: STUDIO_CONTENT_ID },
  });

  if (!row) {
    return buildDefaultStudioContent();
  }

  try {
    return parseStudioContent(row.data);
  } catch (error) {
    console.error("[studio-content] Failed to parse stored content:", error);
    if (options?.strict) {
      throw new StudioContentParseError();
    }
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

export async function resetStudioContentToDefaults(): Promise<StudioContentData> {
  const defaults = buildDefaultStudioContent();
  await prisma.studioContent.upsert({
    where: { id: STUDIO_CONTENT_ID },
    create: { id: STUDIO_CONTENT_ID, data: defaults },
    update: { data: defaults },
  });
  return defaults;
}

export { localeContentFromStudio, studioBranding };
