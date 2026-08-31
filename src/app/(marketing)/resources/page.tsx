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
    title: "Tú pones el precio",
    description:
      "Define cuánto quieres ganar por asesoría. La plataforma añade una comisión transparente visible al cliente, nunca oculta de tu ganancia.",
  },
  {
    icon: Calendar,
    title: "Control total de tu agenda",
    description:
      "Configura tu horario por día de semana, almuerzos, gaps entre citas y fechas bloqueadas. Sin límite de citas diarias.",
  },
  {
    icon: Video,
    title: "Todo desde tu casa",
    description:
      "Las asesorías se realizan por videollamada integrada con chat. No necesitas instalar nada — solo dale click a 'Unirse'.",
  },
  {
    icon: Clock,
    title: "Pagos automáticos",
    description:
      "El cliente paga al agendar y el dinero llega directo a tu cuenta de Mercado Pago. Sin cobros manuales, sin seguimiento.",
  },
  {
    icon: TrendingUp,
    title: "Visibilidad y reputación",
    description:
      "Tu perfil público muestra tus servicios, experiencia y calificaciones de clientes. A más valor, más clientes te encuentran.",
  },
  {
    icon: Shield,
    title: "Seguridad primero",
    description:
      "Tus credenciales de pago son privadas (las ingresas tú directamente en Mercado Pago). Nunca las toca la plataforma.",
  },
];

const steps = [
  {
    number: "1",
    title: "Regístrate",
    description: "Crea tu cuenta en minutos con Google o email.",
  },
  {
    number: "2",
    title: "Verifica tu perfil",
    description: "Sube tus documentos profesionales. Un administrador revisa y aprueba tu cuenta.",
  },
  {
    number: "3",
    title: "Configura tus servicios",
    description: "Crea tus servicios, define precios, horarios y conecta tu Mercado Pago.",
  },
  {
    number: "4",
    title: "Recibe clientes",
    description: "Los clientes te encuentran, agendan y pagan. Tú solo das la asesoría.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-white py-20 px-4">
        <div className="container-meti max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6">
            Comparte tu experiencia,
            <br />
            <span className="text-[var(--accent)]">cobra por tu sabiduría</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Meti te permite monetizar tu conocimiento profesional ofreciendo asesorías por
            videollamada a clientes que buscan tu experiencia. Tú pones el precio, tú defines
            tu horario, tú controlas tu negocio.
          </p>
          <Button size="lg" className="text-base px-8" asChild>
            <Link href="/register">Quiero ser asesor</Link>
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-meti py-20">
        <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] text-center mb-12">
          ¿Por qué unirse a Meti?
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
            ¿Cómo empiezo?
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
          ¿Listo para empezar?
        </h2>
        <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">
          Únete a la red de profesionales de Meti y empieza a ofrecer tus servicios a clientes que buscan tu experiencia.
        </p>
        <Button size="lg" className="text-base px-8" asChild>
          <Link href="/register">Crear mi cuenta de asesor</Link>
        </Button>
      </section>
    </div>
  );
}
