/**
 * Pilates studio branding and runtime configuration.
 * Used across marketing pages, booking flow, and metadata.
 */
export const siteConfig = {
  name: "Flow Pilates",
  tagline: "Book your next session in seconds",
  description:
    "Book mat, reformer, and private pilates sessions online. Choose your class, pick a time, and pay securely.",
  studioCategorySlug: "pilates",
  deliveryMode: "in-person" as const,
  location: "123 Wellness Ave, Studio 2",
  phone: "(555) 012-3456",
  email: "hello@flowpilates.studio",
  sessionTypes: [
    {
      name: "Mat Pilates",
      slug: "mat",
      description: "Core-focused group mat class",
      duration: "55 min",
      priceFrom: 28,
    },
    {
      name: "Reformer",
      slug: "reformer",
      description: "Equipment-based full-body workout",
      duration: "50 min",
      priceFrom: 45,
    },
    {
      name: "Private Session",
      slug: "private",
      description: "One-on-one tailored instruction",
      duration: "60 min",
      priceFrom: 75,
    },
    {
      name: "Duo Session",
      slug: "duo",
      description: "Semi-private session for two",
      duration: "60 min",
      priceFrom: 55,
    },
  ],
} as const;
