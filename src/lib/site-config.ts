/**
 * MeTi Pilates — studio branding, imagery, and content.
 */
export const siteConfig = {
  name: "Meropi Tirri",
  /** Public production URL (override with NEXT_PUBLIC_SITE_URL / APP_URL). */
  siteUrl: "https://metipilates.gr",
  tagline: "Clinical Pilates & Reformer studio",
  description:
    "Physiotherapy-based reformer pilates in small groups — personalized care, safe movement, and lasting results.",
  studioCategorySlug: "pilates",
  /** Only this session type is offered on the public site */
  primarySessionSlug: "reformer",
  /** Max reformer machines / clients per session time */
  slotCapacity: 3,
  /** How many weeks ahead customers can book */
  bookingWeeksAhead: 8,
  /** Default minimum hours before first bookable slot */
  defaultBookingLeadHours: 2,
  /** Checkout / Mercado Pago currency */
  currency: "EUR",
  deliveryMode: "in-person" as const,
  location: "Χριστόφορου Γιατρού 60Α, Άγιος Ιωάννης Πιτσιλιάς, 4071 Λεμεσός",
  phone: "(555) 012-3456",
  email: "tyrri_meropi@hotmail.com",
  hours: "Tue, Thu, Sat · see booking calendar",
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
      duration: "45 min",
      priceFrom: 10,
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

/** Public site URL for metadata, emails, and absolute links. */
export function getSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.APP_URL,
    process.env.BETTER_AUTH_URL,
    siteConfig.siteUrl,
  ];

  for (const value of candidates) {
    const trimmed = value?.trim().replace(/\/$/, "");
    if (!trimmed) continue;
    if (trimmed.includes("localhost") || trimmed.includes("127.0.0.1")) continue;
    return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  }

  return siteConfig.siteUrl;
}

/** Email that receives new-booking and reminder notifications for the studio. */
export function getStudioNotificationEmail(): string {
  const fromEnv = process.env.STUDIO_NOTIFICATION_EMAIL?.trim();
  if (fromEnv) return fromEnv;
  return siteConfig.email;
}
