"use client";

import Link from "next/link";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-secondary via-secondary to-secondary-light text-white">
      {/* Background Pattern */}
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

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-2xl bg-primary/20 blur-xl animate-float" />
      <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-accent/20 blur-xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-lg bg-primary/10 blur-lg animate-float" style={{ animationDelay: "2s" }} />

      <div className="container-meti relative py-20 md:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto text-center">

          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Tu próximo asesor,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
              a un click
            </span>
          </h1>

          {/* Subhead — clear purpose for crawlers */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-fade-in-up stagger-1">
            Meti conecta personas con asesores profesionales por videollamada.
            Legal, finanzas, salud, tecnología y más. Agenda al instante, paga de forma segura con Mercado Pago.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8 animate-fade-in-up stagger-2">
            <div className="relative flex items-center bg-[var(--surface)] rounded-xl shadow-2xl p-1.5 hover:shadow-3xl transition-shadow duration-300">
              <Search className="absolute left-4 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="¿Qué tipo de asesoría necesitas?"
                className="flex-1 h-12 pl-12 pr-4 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-base"
              />
              <Button size="lg" className="rounded-lg px-6 shadow-lg hover:shadow-xl" asChild>
                <Link href="/services">
                  Buscar
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats - Static values for now, will be dynamic later */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in-up stagger-3">
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-white">500+</div>
              <div className="text-sm text-white/70">Asesores activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-white">10,000+</div>
              <div className="text-sm text-white/70">Asesorías realizadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-accent">4.9★</div>
              <div className="text-sm text-white/70">Calificación promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}
