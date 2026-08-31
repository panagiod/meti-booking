/**
 * Flow Pilates — studio branding, imagery, and content.
 */
export const siteConfig = {
  name: "Flow Pilates",
  tagline: "Reformer & mat sessions, booked in minutes",
  description:
    "A calm studio for reformer and mat pilates. Pick your session, choose a time, and show up ready to move.",
  studioCategorySlug: "pilates",
  deliveryMode: "in-person" as const,
  location: "123 Wellness Ave, Studio 2",
  phone: "(555) 012-3456",
  email: "hello@flowpilates.studio",
  hours: "Mon–Fri 6am–8pm · Sat 8am–2pm",
  images: {
    hero:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1920&q=80",
    mat: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    reformer:
      "https://images.unsplash.com/photo-1599901860901-781e6294b7ff?auto=format&fit=crop&w=800&q=80",
    private:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    duo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
  },
  sessionTypes: [
    {
      name: "Mat Pilates",
      slug: "mat",
      description: "Core strength on the mat",
      duration: "55 min",
      priceFrom: 28,
      imageKey: "mat" as const,
    },
    {
      name: "Reformer",
      slug: "reformer",
      description: "Full-body work on the carriage",
      duration: "50 min",
      priceFrom: 45,
      imageKey: "reformer" as const,
    },
    {
      name: "Private",
      slug: "private",
      description: "One-on-one with your instructor",
      duration: "60 min",
      priceFrom: 75,
      imageKey: "private" as const,
    },
    {
      name: "Duo",
      slug: "duo",
      description: "Semi-private for two",
      duration: "60 min",
      priceFrom: 55,
      imageKey: "duo" as const,
    },
  ],
} as const;
