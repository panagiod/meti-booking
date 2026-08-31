import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container-meti py-12 max-w-3xl">
      <Card>
        <CardContent className="p-8 md:p-12 space-y-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
              Política de Privacidad
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Última actualización: 15 de agosto de 2026
            </p>
          </div>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                1. Información que recopilamos
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Cuando utilizas Meti, recopilamos la siguiente información:
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li><strong>Datos de cuenta:</strong> nombre, correo electrónico e imagen de perfil proporcionados a través de Google OAuth.</li>
                <li><strong>Datos de perfil:</strong> biografía, especialidad, documentos de verificación (para asesores).</li>
                <li><strong>Datos de transacciones:</strong> historial de asesorías, pagos procesados por Mercado Pago.</li>
                <li><strong>Datos de uso:</strong> interacciones con la plataforma, reseñas y calificaciones.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                2. Cómo utilizamos tu información
              </h2>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Para proporcionar y mejorar nuestros servicios de asesoría.</li>
                <li>Para procesar pagos y gestionar asesorías.</li>
                <li>Para comunicarnos contigo sobre tu cuenta y asesorías.</li>
                <li>Para verificar la identidad y credenciales de los asesores.</li>
                <li>Para prevenir fraudes y mejorar la seguridad de la plataforma.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                3. Compartición de datos
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                No vendemos tu información personal. Compartimos datos únicamente con:
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li><strong>Mercado Pago:</strong> para procesar pagos (el asesor recibe el pago directamente).</li>
                <li><strong>LiveKit:</strong> para facilitar las videollamadas de asesoría.</li>
                <li><strong>Google:</strong> para la autenticación a través de OAuth.</li>
                <li><strong>Autoridades legales:</strong> cuando lo requiera la ley.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                4. Seguridad de los datos
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Las transacciones de pago se procesan a través de Mercado Pago con encriptación SSL/TLS.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                5. Retención de datos
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Conservamos tu información personal mientras tu cuenta esté activa o sea necesaria para proporcionarte servicios. Si eliminas tu cuenta, eliminaremos tus datos personales dentro de los 30 días, excepto cuando debamos conservarlos por obligación legal.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                6. Tus derechos
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Tienes derecho a:
              </p>
              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 ml-4">
                <li>Acceder a tus datos personales.</li>
                <li>Rectificar datos inexactos.</li>
                <li>Solicitar la eliminación de tus datos.</li>
                <li>Oponerte al procesamiento de tus datos.</li>
                <li>Solicitar la portabilidad de tus datos.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                7. Cookies
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Meti utiliza cookies esenciales para el funcionamiento de la plataforma (sesiones de autenticación). No utilizamos cookies de rastreo o publicitarias.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                8. Cambios en esta política
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Nos reservamos el derecho de actualizar esta política de privacidad. Los cambios importantes se comunicarán a través de la plataforma o por correo electrónico.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
                9. Contacto
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Si tienes preguntas sobre esta política de privacidad, contáctanos a través de{" "}
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
