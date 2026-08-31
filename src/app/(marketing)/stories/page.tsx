import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating-stars";
import { Star } from "lucide-react";

const stories = [
  {
    name: "Laura García",
    role: "Client",
    text: "I needed urgent advice to incorporate my company and found a specialized lawyer the same day. In less than an hour I had clarity on my options. I booked for the following week and it was incredibly practical.",
    advisor: "Dra. María López",
    service: "Company incorporation",
    rating: 5,
    avatar: "L",
    avatarColor: "#00D4AA",
  },
  {
    name: "Carlos Mendoza",
    role: "Advisor",
    text: "Meti allowed me to turn my business consulting experience into a steady additional income. In my first month I completed 8 advisory sessions without investing in marketing. The platform brings me clients.",
    advisor: null,
    service: "Strategic consulting",
    rating: 5,
    avatar: "C",
    avatarColor: "#FF6B35",
  },
  {
    name: "Ana Rodríguez",
    role: "Client",
    text: "As an entrepreneur, having quick access to a life coach has helped me make clearer decisions. The booking process is super simple and the video calls work perfectly.",
    advisor: "Ing. Andrés Paredes",
    service: "Professional coaching",
    rating: 5,
    avatar: "A",
    avatarColor: "#776cff",
  },
  {
    name: "Diego Torres",
    role: "Advisor",
    text: "I've been an advisor on Meti for 6 months and have delivered more than 100 sessions. The flexible schedule system lets me work when I want, and payments always arrive on time to my Mercado Pago account.",
    advisor: null,
    service: "Web development and technology",
    rating: 5,
    avatar: "D",
    avatarColor: "#EB3F00",
  },
  {
    name: "Sofía Martínez",
    role: "Client",
    text: "I found a nutritionist who designed a personalized plan for me. The best part is I can book from my phone anytime, without phone calls. Everything is very professional.",
    advisor: "Dra. Carolina Peña",
    service: "Nutrition and wellness",
    rating: 5,
    avatar: "S",
    avatarColor: "#0303A3",
  },
  {
    name: "Roberto Álvarez",
    role: "Advisor",
    text: "Meti allowed me to scale my independent practice. Before I only had referral clients; now I receive bookings constantly. The dashboard is very clear: I see my appointments, payments, and stats.",
    advisor: null,
    service: "Personal finance",
    rating: 4,
    avatar: "R",
    avatarColor: "#FCC836",
  },
];

const stats = [
  { value: "500+", label: "Active advisors" },
  { value: "10,000+", label: "Sessions completed" },
  { value: "4.9★", label: "Average rating" },
  { value: "98%", label: "Satisfied clients" },
];

export default function StoriesPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-white py-20 px-4">
        <div className="container-meti max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6">
            Success stories
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Real people who transformed their professional experience and projects with Meti
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[var(--background)] py-12 border-b border-[var(--border)]">
        <div className="container-meti flex flex-wrap justify-center gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-heading font-bold text-[var(--primary)]">{stat.value}</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-meti py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: story.avatarColor }}
                  >
                    {story.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{story.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {story.role}
                      {story.advisor && <> · {story.advisor}</>}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1 mb-4">
                  &ldquo;{story.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--background)] px-2 py-1 rounded">
                    {story.service}
                  </span>
                  <RatingStars rating={story.rating} size="sm" showValue={false} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-meti pb-20 text-center">
        <Card className="bg-[var(--secondary)] text-white">
          <CardContent className="p-12">
            <h2 className="font-heading text-2xl font-bold mb-3">
              Ready to start your own story?
            </h2>
            <p className="text-white/70 mb-6 max-w-lg mx-auto">
              Join hundreds of professionals who are already transforming their careers with Meti.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="px-8" asChild>
                <Link href="/services">Browse advisors</Link>
              </Button>
              <Button variant="secondary" className="px-8 border-white text-white hover:bg-white hover:text-[var(--secondary)]" asChild>
                <Link href="/register">Become an advisor</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
