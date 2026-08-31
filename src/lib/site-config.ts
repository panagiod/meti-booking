/**
 * Flow Pilates — studio branding, imagery, and content.
 */
export const siteConfig = {
  name: "Flow Pilates",
  tagline: "Reformer pilates studio in the heart of the city",
  description:
    "Book reformer sessions online. Pick a time, show up, move well.",
  studioCategorySlug: "pilates",
  /** Only this session type is offered on the public site */
  primarySessionSlug: "reformer",
  deliveryMode: "in-person" as const,
  location: "123 Wellness Ave, Studio 2",
  phone: "(555) 012-3456",
  email: "hello@flowpilates.studio",
  hours: "Mon–Fri 6am–8pm · Sat 8am–2pm",
  images: {
    hero: "https://images.unsplash.com/photo-1599901860901-781e6294b7ff?auto=format&fit=crop&w=1600&q=85",
    reformer:
      "https://images.unsplash.com/photo-1576678927484-cc9079570887?auto=format&fit=crop&w=900&q=85",
  },
  sessionTypes: [
    {
      name: "Reformer",
      slug: "reformer",
      description: "Spring-loaded carriage work for strength, length, and control.",
      duration: "50 min",
      priceFrom: 45,
      imageKey: "reformer" as const,
      featured: true,
    },
  ],
} as const;

/** Match bookable services from the API (demo DB uses this name). */
export const REFORMER_SERVICE_NAME = "Reformer Session";

export function isReformerService(serviceName: string): boolean {
  return serviceName.toLowerCase().includes("reformer");
}
