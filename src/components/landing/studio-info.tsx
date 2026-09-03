"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudioBranding } from "@/components/providers/locale-provider";

export function StudioInfo() {
  const studio = useStudioBranding();

  return (
    <section className="py-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="container-meti relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Visit {studio.name}
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Reformer sessions in a calm, fully equipped studio.
              Arrive 10 minutes early for your first visit so we can get you set up.
            </p>

            <ul className="space-y-4 mb-8 text-white/95">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 shrink-0" />
                {studio.location}
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0" />
                {studio.phone}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0" />
                {studio.email}
              </li>
            </ul>

            <Button
              size="lg"
              className="bg-white text-[var(--primary)] hover:bg-white/90 shadow-lg"
              asChild
            >
              <Link href="/book">
                Book your session
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="bg-white rounded-xl p-6 shadow-2xl text-[var(--text-primary)]">
                <h4 className="font-heading font-bold text-lg mb-4">Studio hours</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-muted)]">Monday – Friday</dt>
                    <dd className="font-medium">6:00 AM – 8:00 PM</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-muted)]">Saturday</dt>
                    <dd className="font-medium">8:00 AM – 2:00 PM</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--text-muted)]">Sunday</dt>
                    <dd className="font-medium">Closed</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-[var(--text-muted)]">
                  Free cancellation up to 12 hours before your session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
