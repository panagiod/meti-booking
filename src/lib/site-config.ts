/**
 * Flow Pilates — studio branding, imagery, and content.
 */
export const siteConfig = {
  name: "Flow Pilates",
  tagline: "Reformer & mat studio in the heart of the city",
  description:
    "Small-group reformer and mat classes. Book online, show up, move well.",
  studioCategorySlug: "pilates",
  deliveryMode: "in-person" as const,
  location: "123 Wellness Ave, Studio 2",
  phone: "(555) 012-3456",
  email: "hello@flowpilates.studio",
  hours: "Mon–Fri 6am–8pm · Sat 8am–2pm",
  images: {
    hero: "https://images.unsplash.com/photo-1599901860901-781e6294b7ff?auto=format&fit=crop&w=1600&q=85",
    mat: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85",
    reformer:
      "https://images.unsplash.com/photo-1576678927484-cc9079570887?auto=format&fit=crop&w=900&q=85",
    private:
      "https://images.unsplash.com/photo-1599901860901-781e6294b7ff?auto=format&fit=crop&w=900&q=85",
    duo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85",
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
    {
      name: "Mat Pilates",
      slug: "mat",
      description: "Floor-based flow focused on core stability and mobility.",
      duration: "55 min",
      priceFrom: 28,
      imageKey: "mat" as const,
      featured: false,
    },
    {
      name: "Private",
      slug: "private",
      description: "Fully tailored session with your instructor.",
      duration: "60 min",
      priceFrom: 75,
      imageKey: "private" as const,
      featured: false,
    },
    {
      name: "Duo",
      slug: "duo",
      description: "Semi-private session — bring a friend.",
      duration: "60 min",
      priceFrom: 55,
      imageKey: "duo" as const,
      featured: false,
    },
  ],
} as const;
