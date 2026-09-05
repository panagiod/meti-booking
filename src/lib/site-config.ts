/**
 * MeTi Pilates — studio branding, imagery, and content.
 */
export const siteConfig = {
  name: "Meropi Tirri",
  /** Public production URL (override with NEXT_PUBLIC_SITE_URL / APP_URL). */
  siteUrl: "https://meti-pilates.com",
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
  location: "60A Christoforou Giatrou, Agios Ioannis Pitsilias, 4071 Limassol",
  mapsUrl: "https://maps.app.goo.gl/r2C9X5e88pgco3hT7?g_st=ac",
  phone: "+35795519786",
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

/** Parse studio notification inboxes from env (comma- or semicolon-separated). */
export function getStudioNotificationEmails(): string[] {
  const fromEnv = process.env.STUDIO_NOTIFICATION_EMAIL?.trim();
  const raw = fromEnv || siteConfig.email;
  const seen = new Set<string>();
  const emails: string[] = [];

  for (const part of raw.split(/[,;]+/)) {
    const email = part.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }

  return emails;
}

/** Primary studio notification inbox (first address in STUDIO_NOTIFICATION_EMAIL). */
export function getStudioNotificationEmail(): string {
  return getStudioNotificationEmails()[0] ?? siteConfig.email;
}

/** Hide empty or placeholder (555) numbers from the public site. */
export function isPublicPhone(phone: string | null | undefined): boolean {
  const value = phone?.trim() ?? "";
  if (!value) return false;
  if (value.includes("555")) return false;
  return true;
}

export function sanitizeStudioPhone(phone: string | null | undefined): string {
  return isPublicPhone(phone) ? phone!.trim() : "";
}

/** Display form for the studio mobile, e.g. +357 95 519786. */
export function formatStudioPhone(phone: string | null | undefined): string {
  const trimmed = phone?.trim() ?? "";
  const digits = trimmed.replace(/\D/g, "");
  if (digits === "35795519786") return "+357 95 519786";
  return trimmed;
}

export function studioTelHref(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits ? `tel:+${digits}` : "";
}

export function studioMapsUrl(): string {
  return siteConfig.mapsUrl;
}
