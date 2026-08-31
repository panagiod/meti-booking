import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Clock,
  DollarSign,
  Shield,
  Video,
  TrendingUp,
  Calendar,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "You set the price",
    description:
      "Define how much you want to earn per session. The platform adds a transparent fee visible to the client, never hidden from your earnings.",
  },
  {
    icon: Calendar,
    title: "Full control of your schedule",
    description:
      "Configure your schedule by day of week, lunch breaks, gaps between appointments, and blocked dates. No daily appointment limit.",
  },
  {
    icon: Video,
    title: "Everything from home",
    description:
      "Sessions are conducted via integrated video calls with chat. No installation needed — just click 'Join'.",
  },
  {
    icon: Clock,
    title: "Automatic payments",
    description:
      "The client pays when booking and funds arrive directly to your Mercado Pago account. No manual invoicing, no follow-up.",
  },
  {
    icon: TrendingUp,
    title: "Visibility and reputation",
    description:
      "Your public profile shows your services, experience, and client ratings. Higher value brings more clients to you.",
  },
  {
    icon: Shield,
    title: "Security first",
    description:
      "Your payment credentials are private (you enter them directly in Mercado Pago). The platform never touches them.",
  },
];

const steps = [
  {
    number: "1",
    title: "Sign up",
    description: "Create your account in minutes with Google or email.",
  },
  {
    number: "2",
    title: "Verify your profile",
    description: "Upload your professional documents. An administrator reviews and approves your account.",
  },
  {
    number: "3",
    title: "Set up your services",
    description: "Create your services, set prices, schedules, and connect your Mercado Pago.",
  },
  {
    number: "4",
    title: "Receive clients",
    description: "Clients find you, book, and pay. You deliver the advisory session.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-white py-20 px-4">
        <div className="container-meti max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6">
            Share your expertise,
            <br />
            <span className="text-[var(--accent)]">earn from your knowledge</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Meti lets you monetize your professional knowledge by offering advisory sessions via
            video call to clients seeking your experience. You set the price, you define
            your schedule, you control your business.
          </p>
          <Button size="lg" className="text-base px-8" asChild>
            <Link href="/register">Become an advisor</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-meti py-20">
        <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] text-center mb-12">
          Why join Meti?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card key={benefit.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--background)] py-20 px-4">
        <div className="container-meti max-w-4xl">
          <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] text-center mb-12">
            How do I get started?
          </h2>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white font-heading font-bold text-xl flex items-center justify-center flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg text-[var(--text-primary)] mb-1">
                    {step.title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="container-meti py-20 text-center">
        <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-4">
          Ready to get started?
        </h2>
        <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">
          Join Meti&apos;s network of professionals and start offering your services to clients seeking your expertise.
        </p>
        <Button size="lg" className="text-base px-8" asChild>
          <Link href="/register">Create my advisor account</Link>
        </Button>
      </section>
    </div>
  );
}
