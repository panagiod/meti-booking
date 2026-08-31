import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/ui/rating-stars";
import { Star } from "lucide-react";

const stories = [
  {
    name: "Laura García",
    role: "Cliente",
    text: "Necesitaba asesoría urgente para constituir mi empresa y encontré a un abogado especializado en el mismo día. En menos de una hora ya tenía claras las opciones. La agendé para la siguiente semana y fue increíblemente práctica.",
    advisor: "Dra. María López",
    service: "Constitución de empresa",
    rating: 5,
    avatar: "L",
    avatarColor: "#00D4AA",
  },
  {
    name: "Carlos Mendoza",
    role: "Asesor",
    text: "Meti me permitió convertir mi experiencia en consultoría empresarial en un ingreso adicional estable. En el primer mes completé 8 asesorías sin invertir en marketing. La plataforma me trae los clientes.",
    advisor: null,
    service: "Consultoría estratégica",
    rating: 5,
    avatar: "C",
    avatarColor: "#FF6B35",
  },
  {
    name: "Ana Rodríguez",
    role: "Cliente",
    text: "Como emprendedora, tener acceso rápido a un coach de vida me ha ayudado a tomar decisiones más claras. El proceso de agendar es súper sencillo y las videollamadas funcionan perfecto.",
    advisor: "Ing. Andrés Paredes",
    service: "Coaching profesional",
    rating: 5,
    avatar: "A",
    avatarColor: "#776cff",
  },
  {
    name: "Diego Torres",
    role: "Asesor",
    text: "Llevo 6 meses como asesor en Meti y he dado más de 100 asesorías. El sistema de horarios flexibles me permite trabajar cuando quiero, y los pagos siempre llegan a tiempo a mi cuenta de Mercado Pago.",
    advisor: null,
    service: "Desarrollo web y tecnología",
    rating: 5,
    avatar: "D",
    avatarColor: "#EB3F00",
  },
  {
    name: "Sofía Martínez",
    role: "Cliente",
    text: "Encontré a una nutricionista que me diseñó un plan personalizado. Lo mejor es que puedo agendar desde mi celular en cualquier momento, sin llamadas telefónicas. Todo es muy profesional.",
    advisor: "Dra. Carolina Peña",
    service: "Nutrición y bienestar",
    rating: 5,
    avatar: "S",
    avatarColor: "#0303A3",
  },
  {
    name: "Roberto Álvarez",
    role: "Asesor",
    text: "Meti me permitió escalar mi práctica independiente. Antes solo tenía clientes por referidos, ahora recibo reservas constantemente. El panel de control es muy claro: veo mis citas, mis pagos y mis estadísticas.",
    advisor: null,
    service: "Finanzas personales",
    rating: 4,
    avatar: "R",
    avatarColor: "#FCC836",
  },
];

const stats = [
  { value: "500+", label: "Asesores activos" },
  { value: "10,000+", label: "Asesorías realizadas" },
  { value: "4.9★", label: "Calificación promedio" },
  { value: "98%", label: "Clientes satisfechos" },
];

export default function StoriesPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-white py-20 px-4">
        <div className="container-meti max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-6">
            Historias de éxito
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Personas reales que transformaron su experiencia profesional y sus proyectos con Meti
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
              ¿Listo para empezar tu propia historia?
            </h2>
            <p className="text-white/70 mb-6 max-w-lg mx-auto">
              Únete a cientos de profesionales que ya están transformando sus carreras con Meti.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="px-8" asChild>
                <Link href="/services">Explorar asesores</Link>
              </Button>
              <Button variant="secondary" className="px-8 border-white text-white hover:bg-white hover:text-[var(--secondary)]" asChild>
                <Link href="/register">Quiero ser asesor</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
