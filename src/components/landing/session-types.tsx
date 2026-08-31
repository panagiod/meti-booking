"use client";

import Link from "next/link";
import { ArrowRight, Clock, DollarSign } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function SessionTypes() {
  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="container-meti">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Choose your session
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Mat, reformer, private, and duo sessions — all bookable online with real-time availability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {siteConfig.sessionTypes.map((session, index) => (
            <Link key={session.slug} href="/book" className="group">
              <div
                className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <h3 className="font-heading font-semibold text-lg text-[var(--text-primary)] mb-2">
                  {session.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">{session.description}</p>
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {session.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    from ${session.priceFrom}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 text-[var(--primary)] font-semibold hover:gap-3 transition-all duration-300"
          >
            Book a session
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
