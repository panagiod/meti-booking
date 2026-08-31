"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Zap, Shield, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Zap,
    text: "Set your own prices and schedule",
  },
  {
    icon: Shield,
    text: "Get paid directly through your Mercado Pago account",
  },
  {
    icon: Video,
    text: "Integrated video calls and chat",
  },
  {
    icon: Clock,
    text: "No daily session limit",
  },
  {
    icon: CheckCircle,
    text: "Run promotions whenever you choose",
  },
];

export function CTAAdvisor() {
  return (
    <section
      id="para-asesores"
      className="py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container-meti relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Are you a professional? Offer your advisory services with Meti
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Join our platform and reach clients seeking your
              expertise. You set your prices, schedule, and terms. We
              handle the technology.
            </p>

            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 animate-fade-in-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4" />
                  </div>
                  <span className="text-white/95">{benefit.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-[var(--primary)] hover:bg-white/90 shadow-lg hover:shadow-xl"
                asChild
              >
                <Link href="/register">
                  Get started
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="#como-funciona">Learn more</Link>
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 animate-fade-in-right">
              {/* Mock advisor card */}
              <div className="bg-white rounded-xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--primary)]">JP</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-[var(--text-primary)]">
                      Juan Pérez
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      Corporate law
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Earnings per session</span>
                  <span className="font-heading font-bold text-[var(--primary)]">
                    $50,000
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-[var(--text-muted)]">Platform fee</span>
                  <span className="text-[var(--text-secondary)]">$7,500</span>
                </div>
                <div className="border-t border-[var(--border)] mt-4 pt-4 flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">
                    Client total
                  </span>
                  <span className="font-heading font-bold text-lg text-[var(--text-primary)]">
                    $57,500
                  </span>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-[var(--accent)] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-float">
                100% Online
              </div>
              <div className="absolute -bottom-4 -left-4 bg-[var(--secondary)] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-float" style={{ animationDelay: "1s" }}>
                Secure payment
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
