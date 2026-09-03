import { z } from "zod";

export const aboutCertificationSchema = z.object({
  name: z.string().min(1),
  detail: z.string(),
});

export const aboutContentSchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  certificationsIntro: z.string().min(1),
  certifications: z.array(aboutCertificationSchema).min(1),
  specialization: z.string().min(1),
  philosophyTitle: z.string().min(1),
  philosophyParagraph1: z.string().min(1),
  philosophyParagraph2: z.string().min(1),
  programIntro: z.string().min(1),
  programBenefits: z.array(z.string().min(1)).min(1),
  closingTitle: z.string().min(1),
  closingText: z.string().min(1),
});

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
  about: aboutContentSchema,
  common: z.object({
    hours: z.string().min(1),
  }),
});

export const studioContentSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
  heroImage: z.string().min(1),
  reformerImage: z.string().min(1),
  sessionPriceFrom: z.number().min(0),
  contentEn: studioLocaleContentSchema,
  contentEl: studioLocaleContentSchema,
});

export type AboutContent = z.infer<typeof aboutContentSchema>;
export type StudioLocaleContent = z.infer<typeof studioLocaleContentSchema>;
export type StudioContentData = z.infer<typeof studioContentSchema>;
