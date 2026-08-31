import { z } from "zod";

export const studioLocaleContentSchema = z.object({
  meta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    bookSession: z.string().min(1),
    imageAlt: z.string().min(1),
  }),
  common: z.object({
    hours: z.string().min(1),
  }),
});

export const studioContentSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  heroImage: z.string().min(1),
  reformerImage: z.string().min(1),
  sessionPriceFrom: z.number().min(0),
  contentEn: studioLocaleContentSchema,
  contentEl: studioLocaleContentSchema,
});

export type StudioLocaleContent = z.infer<typeof studioLocaleContentSchema>;
export type StudioContentData = z.infer<typeof studioContentSchema>;
