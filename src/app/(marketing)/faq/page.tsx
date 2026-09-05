import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatStudioPhone, siteConfig, studioMapsUrl, studioTelHref } from "@/lib/site-config";

export default function FAQPage() {
  const items = [
    {
      q: "How do I book a session?",
      a: "Open Book, pick a date and time with an open reformer place, and confirm with your email. You do not need an account.",
    },
    {
      q: "How do I pay?",
      a: `Payment is at the studio. Reformer sessions start from €${siteConfig.sessionTypes[0].priceFrom}. There is no online payment on this site. If you book and do not cancel at least 24 hours before, the session must still be paid.`,
    },
    {
      q: "How do I cancel?",
      a: "Use the link in your confirmation email or sign in to your account. Free cancellation needs at least 24 hours’ notice. Later than that, or if you do not come, the session must still be paid.",
    },
    {
      q: "What if I arrive late?",
      a: "Classes start on time and do not wait. Join quietly if you can; the session will not be delayed or extended.",
    },
    {
      q: "Where is the studio?",
      a: `${siteConfig.location}.`,
    },
    {
      q: "What should I bring?",
      a: "Wear comfortable movement clothing. Arrive a few minutes early so you are ready when the class starts. First visits: come about 10 minutes early so we can get you set up on the reformer.",
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
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {item.q === "Where is the studio?" ? (
                  <>
                    <a
                      href={studioMapsUrl()}
                      target="_blank"
                      rel="noopener"
                      className="text-[var(--primary)] hover:underline"
                    >
                      {siteConfig.location}
                    </a>
                    .
                  </>
                ) : (
                  item.a
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-8 text-sm text-[var(--text-muted)]">
        More questions?{" "}
        <a href={studioTelHref(siteConfig.phone)} className="text-[var(--primary)] hover:underline">
          {formatStudioPhone(siteConfig.phone)}
        </a>
        {" · "}
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
