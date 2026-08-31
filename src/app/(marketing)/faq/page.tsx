import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "¿Cómo funciona Meti?",
    answer: "Meti conecta profesionales independientes con personas que buscan asesoría especializada. Buscas el servicio que necesitas, eliges fecha y horario, pagas con Mercado Pago y te unes a la videollamada desde la plataforma.",
  },
  {
    question: "¿Cuánto cuesta usar Meti como cliente?",
    answer: "No hay costo por usar la plataforma como cliente. Solo pagas el valor del servicio del asesor, más una comisión de la plataforma que se muestra transparentmente en el checkout antes de pagar.",
  },
  {
    question: "¿Cómo puedo ser asesor en Meti?",
    answer: "Regístrate como usuario, completa el proceso de verificación con tus documentos profesionales, crea tus servicios y horarios. Un administrador verificará tu perfil para que puedas recibir clientes.",
  },
  {
    question: "¿Qué pasa si cancelo una asesoría?",
    answer: "Puedes reagendar gratis con al menos 24 horas de anticipación. Cancelar sin reagendar no genera devolución del pago, según la política de cancelación del asesor.",
  },
  {
    question: "¿Cómo se realizan los pagos?",
    answer: "Los pagos se procesan a través de Mercado Pago. Cada asesor configura sus propias credenciales de Mercado Pago para recibir los pagos directamente. La plataforma cobra una comisión transparente que se muestra en el checkout.",
  },
  {
    question: "¿Cómo son las videollamadas?",
    answer: "Las asesorías se realizan por videollamada integrada en la plataforma a través de LiveKit. No necesitas instalar nada adicional; solo dale click a 'Unirse' en tu cita y la videollamada se abrirá automáticamente.",
  },
  {
    question: "¿Puedo cambiar mi contraseña o método de acceso?",
    answer: "Actualmente puedes iniciar sesión con Google o con tu email y contraseña. Si creaste tu cuenta con email y contraseña, puedes usar ese método. Si usaste Google, inicia sesión con Google.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer: "Sí. No vendemos tu información personal. Los pagos se procesan por Mercado Pago con encriptación SSL/TLS. Las videollamadas están protegidas con credenciales únicas por sesión. Consulta nuestra Política de Privacidad para más detalles.",
  },
];

export default function FAQPage() {
  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
        Preguntas frecuentes
      </h1>
      <p className="text-[var(--text-muted)] mb-8">
        Encuentra respuestas a las dudas más comunes sobre Meti
      </p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-2">
                {faq.question}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--text-muted)] mb-3">
          ¿No encontraste lo que buscabas?
        </p>
        <Link href="/services" className="text-sm text-[var(--primary)] font-medium hover:underline">
          Explorar asesores
        </Link>
      </div>
    </div>
  );
}
