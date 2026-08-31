/**
 * MeTi Pilates — studio branding, imagery, and content.
 */
export const siteConfig = {
  name: "MeTi Pilates",
  tagline: "Reformer pilates studio in the heart of the city",
  description:
    "Book reformer sessions online. Pick a time, show up, move well.",
  studioCategorySlug: "pilates",
  /** Only this session type is offered on the public site */
  primarySessionSlug: "reformer",
  /** Max reformer machines / clients per session time */
  slotCapacity: 3,
  /** How many weeks ahead customers can book */
  bookingWeeksAhead: 8,
  /** Default minimum hours before first bookable slot */
  defaultBookingLeadHours: 2,
  deliveryMode: "in-person" as const,
  location: "123 Wellness Ave, Studio 2",
  phone: "(555) 012-3456",
  email: "hello@meti-pilates.studio",
  hours: "Mon, Wed, Sat · 2pm–5pm",
  images: {
    /** Reformer pilates only — bundled studio photos (Pexels, free license) */
    hero: "/images/hero.jpg",
    reformer: "/images/reformer.jpg",
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
  const name = serviceName.toLowerCase();
  if (
    name.includes("mat") ||
    name.includes("duo") ||
    name.includes("private") ||
    name.includes("group")
  ) {
    return false;
  }
  return name.includes("reformer");
}
