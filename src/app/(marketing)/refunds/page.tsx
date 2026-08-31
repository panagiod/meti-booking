import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function RefundsPage() {
  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">
        Cancelaciones y reembolsos
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">
        Última actualización: 15 de agosto de 2026
      </p>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Reagendamiento
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>Puedes reagendar tu asesoría <strong>gratis</strong> con al menos 24 horas de anticipación antes de la fecha y hora programada.</li>
              <li>El tiempo mínimo de anticipación puede variar según la configuración del asesor.</li>
              <li>Al reagendar, pierdes el horario original y debes elegir uno nuevo entre los disponibles.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Cancelación sin reagendar
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>Si cancelas una asesoría sin reagendarla, <strong>no se realiza devolución del pago</strong>.</li>
              <li>Esto aplica independientemente del tiempo de anticipación.</li>
              <li>El asesor recibe el pago completo por la cancelación.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              No presentarse
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>Si no te presentas a la asesoría sin cancelar previamente, <strong>no se realiza devolución</strong>.</li>
              <li>Esto es considerado como una asesoría completada para efectos de cobro.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Pagos
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>Los pagos se procesan por Mercado Pago al momento de confirmar la reserva.</li>
              <li>El dinero llega directamente a la cuenta de Mercado Pago del asesor.</li>
              <li>Meti cobra una comisión transparente que se muestra en el checkout antes de pagar.</li>
              <li>Las disputas de pago se gestionan a través de Mercado Pago según su política de protección al comprador.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">
              Cancelación por parte del asesor
            </h2>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2 list-disc list-inside">
              <li>Si un asesor cancela una asesoría confirmada, el cliente recibe la <strong>devolución completa</strong>.</li>
              <li>Las cancelaciones frecuentes por parte del asesor pueden resultar en la suspensión de su cuenta.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] mb-3">
            ¿Tienes dudas sobre una cancelación específica?
          </p>
          <Link href="/services" className="text-sm text-[var(--primary)] font-medium hover:underline">
            Explorar asesores
          </Link>
        </div>
      </div>
    </div>
  );
}
