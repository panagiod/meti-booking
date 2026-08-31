"use client";

import Link from "next/link";
import { Calendar, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-secondary via-secondary to-secondary-light text-white">
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, var(--primary) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, var(--accent) 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="absolute top-20 left-10 w-20 h-20 rounded-2xl bg-primary/20 blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-accent/20 blur-xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="container-meti relative py-20 md:py-32 lg:py-36">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-4 animate-fade-in-up">
            {siteConfig.name}
          </p>

          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Book your next{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
              pilates session
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 animate-fade-in-up stagger-1">
            {siteConfig.description}
          </p>

          <p className="inline-flex items-center gap-2 text-sm text-white/70 mb-10 animate-fade-in-up stagger-1">
            <MapPin className="w-4 h-4" />
            {siteConfig.location}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up stagger-2">
            <Button size="lg" className="rounded-lg px-8 shadow-lg hover:shadow-xl" asChild>
              <Link href="/book">
                <Calendar className="w-5 h-5 mr-2" />
                Book a session
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="rounded-lg px-8" asChild>
              <Link href="#sessions">View session types</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in-up stagger-3">
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-white">4</div>
              <div className="text-sm text-white/70">Session types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-white">Mon–Sat</div>
              <div className="text-sm text-white/70">Open 7 days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-accent">4.9★</div>
              <div className="text-sm text-white/70">Client rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
