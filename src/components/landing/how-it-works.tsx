"use client";

import { Search, Calendar, Video, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Busca",
    description:
      "Explora asesores por categoría, precio o calificación. Mira videos de presentación y reseñas de otros clientes.",
    color: "var(--primary)",
    bgColor: "var(--primary-light)",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Agenda",
    description:
      "Selecciona el servicio que necesitas y elige un horario disponible. Paga de forma segura con Mercado Pago.",
    color: "var(--accent)",
    bgColor: "var(--accent-light)",
  },
  {
    icon: Video,
    number: "03",
    title: "Conecta",
    description:
      "Únete a la videollamada al momento acordado. Comparte documentos por chat si es necesario.",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
  },
  {
    icon: Star,
    number: "04",
    title: "Califica",
    description:
      "Después de la asesoría, califica tu experiencia. Tu feedback ayuda a otros clientes a elegir.",
    color: "var(--warning)",
    bgColor: "var(--warning-light)",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-[var(--surface)]">
      <div className="container-meti">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Cómo funciona
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Encontrar y agendar una asesoría profesional nunca fue tan fácil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-[var(--border)] to-transparent">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-r border-t border-[var(--border)] bg-[var(--surface)]" />
                </div>
              )}

              <div className="text-center">
                {/* Icon */}
                <div className="relative inline-flex mb-6">
                  <div
                    className="flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                    style={{ backgroundColor: step.bgColor }}
                  >
                    <step.icon className="w-10 h-10" style={{ color: step.color }} />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
