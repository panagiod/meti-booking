import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
export default function CookiesPage() {
  const cookies = [
    { name: "Sesión de autenticación", desc: "Mantiene tu sesión activa para que no tengas que iniciar sesión en cada página. Se almacena al iniciar sesión y se elimina al cerrar sesión.", key: "better-auth.session_token" },
    { name: "Preferencias de idioma", desc: "Recuerda tu idioma preferido para mostrar la interfaz en español u otro idioma.", key: "lang" },
  ];
  return (
    <div className="container-meti py-16 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">Política de cookies</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Última actualización: 15 de agosto de 2026</p>
      <div className="space-y-6">
        <Card><CardContent className="p-6">
          <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">¿Qué son las cookies?</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas una página web. Permiten que la plataforma recuerde tus preferencias y mantenga tu sesión activa.</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">Cookies que utilizamos</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">Meti utiliza únicamente <strong>cookies esenciales</strong> para el funcionamiento de la plataforma. No utilizamos cookies de rastreo, publicitarias ni analíticas de terceros.</p>
          <div className="bg-[var(--background)] rounded-lg p-4 text-sm space-y-3">
            {cookies.map((c) => (
              <div key={c.key} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{c.name}</p>
                  <p className="text-[var(--text-muted)]">{c.desc}</p>
                  <code className="text-xs text-[var(--text-muted)] bg-[var(--surface)] px-1.5 py-0.5 rounded mt-1 inline-block">{c.key}</code>
                </div>
              </div>
            ))}
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">¿Cómo gestionar las cookies?</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Puedes configurar tu navegador para rechazar cookies o eliminarlas. Ten en cuenta que al rechazar las cookies, Meti no podrá mantener tu sesión activa y tendrás que iniciar sesión en cada visita.</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <h2 className="font-heading font-semibold text-[var(--text-primary)] mb-3">Cookies de terceros</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Meti no instala cookies de rastreo ni publicitarias de terceros. El contenido embebido de YouTube en los perfiles de asesores puede generar cookies propias de YouTube al reproducir un video, pero esto ocurre solo bajo tu interacción directa.</p>
        </CardContent></Card>
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">¿Preguntas sobre nuestras cookies? Contáctanos en <a href="mailto:edwaramayadiaz@gmail.com" className="text-[var(--primary)] hover:underline">edwaramayadiaz@gmail.com</a></p>
        </div>
      </div>
    </div>
  );
}
