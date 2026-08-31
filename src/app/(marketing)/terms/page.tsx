import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="container-meti py-12 max-w-3xl">
      <Card>
        <CardContent className="p-8 md:p-12 space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
              Condiciones del Servicio
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Última actualización: 15 de agosto de 2026
            </p>
          </div>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                1. Descripción del servicio
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Meti es una plataforma que conecta profesionales independientes (asesores) con clientes que buscan asesoría especializada. Los servicios se prestan por videollamada y los pagos se procesan a través de Mercado Pago.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                2. Cuentas de usuario
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Para usar Meti debes crear una cuenta a través de Google OAuth.</li>
                <li>Eres responsable de mantener la confidencialidad de tu cuenta.</li>
                <li>Debes proporcionar información precisa y actualizada.</li>
                <li>Solo puedes crear una cuenta por persona.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                3. Roles de usuario
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li><strong>Cliente:</strong> busca y agenda asesorías con profesionales.</li>
                <li><strong>Asesor:</strong> ofrece servicios de asesoría profesional, configura sus propios precios, horarios y credenciales de pago.</li>
                <li><strong>Administrador:</strong> gestiona la plataforma, verifica asesores y configura comisiones.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                4. Pagos y comisiones
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Los pagos se procesan directamente a través de la cuenta de Mercado Pago del asesor (modelo sin custodia).</li>
                <li>Meti cobra una comisión por servicio, visible en el checkout antes del pago.</li>
                <li>El precio final incluye: precio del asesor + comisión de la plataforma.</li>
                <li>Los reembolsos se gestionan según la política de cancelación del asesor.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                5. Cancelación y reagendamiento
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li><strong>Reagendar:</strong> gratis con anticipación mínima configurable por el asesor.</li>
                <li><strong>Cancelar sin reagendar:</strong> sin devolución del pago.</li>
                <li><strong>No presentarse:</strong> sin devolución del pago.</li>
                <li>La anticipación mínima para reagendar se muestra al momento de la reserva.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                6. Videollamadas
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Las asesorías se realizan por videollamada a través de la plataforma.</li>
                <li>El enlace de videollamada se envía después de confirmar el pago.</li>
                <li>Meti no se hace responsable por problemas de conectividad del usuario.</li>
                <li>Las grabaciones de videollamadas se almacenan según la configuración del asesor.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                7. Contenido y conducta
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>No se permite contenido ilegal, ofensivo o que viole los derechos de terceros.</li>
                <li>Los asesores deben mantener un comportamiento profesional.</li>
                <li>Meti se reserva el derecho de suspender cuentas que violen estas condiciones.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                8. Propiedad intelectual
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Todo el contenido de la plataforma (diseño, código, marca) es propiedad de Meti. Los asesores conservan los derechos sobre su contenido profesional (biografía, especialidades).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                9. Limitación de responsabilidad
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Meti actúa como intermediario entre asesores y clientes. No somos parte de la relación contractual entre asesor y cliente. No garantizamos la calidad de los servicios prestados por los asesores.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                10. Cambios en las condiciones
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Nos reservamos el derecho de modificar estas condiciones en cualquier momento. Los cambios significativos se comunicarán a través de la plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                11. Contacto
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Para preguntas sobre estas condiciones, contáctanos a través de{" "}
                <a href="mailto:edwaramayadiaz@gmail.com" className="text-[var(--primary)] hover:underline">
                  edwaramayadiaz@gmail.com
                </a>.
              </p>
            </section>

            <div className="pt-4 border-t border-[var(--border)]">
              <Link href="/" className="text-sm text-[var(--primary)] hover:underline">
                ← Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
