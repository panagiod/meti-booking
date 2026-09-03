import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/lib/site-config";

export default function FAQPage() {
  const items = [
    {
      q: "How do I book a session?",
      a: "Open Book, pick a date and time with an open reformer place, and confirm with your email. You do not need an account.",
    },
    {
      q: "How do I pay?",
      a: `Payment is at the studio. Reformer sessions start from €${siteConfig.sessionTypes[0].priceFrom}. There is no online payment on this site.`,
    },
    {
      q: "How do I cancel?",
      a: "Use the link in your confirmation email or sign in to your account. Cancellations need at least 24 hours’ notice.",
    },
    {
      q: "Where is the studio?",
      a: siteConfig.location,
    },
    {
      q: "What should I bring?",
      a: "Wear comfortable movement clothing. Arrive about 10 minutes early on your first visit so we can get you set up on the reformer.",
    },
    {
      q: "Who teaches?",
      a: "Sessions are with Meropi Tirri, physiotherapist and Clinical Pilates & Reformer instructor.",
    },
  ];

  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
        Frequently asked questions
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Booking, payment, and visiting MeTi Pilates.
      </p>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.q}>
            <CardContent className="p-6">
              <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-2">
                {item.q}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-8 text-sm text-[var(--text-muted)]">
        More questions?{" "}
        <a href={`mailto:${siteConfig.email}`} className="text-[var(--primary)] hover:underline">
          {siteConfig.email}
        </a>
        {" · "}
        <Link href="/book" className="text-[var(--primary)] hover:underline">
          Book a session
        </Link>
      </div>
    </div>
  );
}
