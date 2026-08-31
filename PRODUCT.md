# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Asesores (Profesionales):**
- Profesionales independientes de diversos rubros (legal, financiero, salud, tecnología, educación, etc.)
- Quieren monetizar su experiencia ofreciendo asesorías por videollamada
- Necesitan control total sobre su agenda, precios y disponibilidad
- Buscan una plataforma que les facilite la gestión sin complicaciones técnicas

**Clientes:**
- Personas naturales y PyMEs que buscan asesoría profesional especializada
- Prefieren la comodidad de atenderse desde cualquier lugar (100% online)
- Valoran la transparencia de precios y la facilidad de agendado
- Quieren una experiencia segura y profesional

**Administradores:**
- Equipo de Meti encargado de gestionar la plataforma
- Nivel Superadmin: Control total del sistema
- Nivel Gestor: Resolución de problemas con la plataforma
- Configuran fees, supervisan operaciones, gestionan facturación

## Product Purpose

Meti conecta profesionales que quieren ofrecer asesorías con clientes que buscan orientación especializada. La plataforma elimina las barreras de geografía y logística, permitiendo que las asesorías ocurran por videollamada con la misma calidad que una reunión presencial.

**Éxito se define como:**
- Asesores que activan sus servicios y reciben clientes regularmente
- Clientes que encuentran el asesor adecuado y completan asesorías satisfactorias
- Transacciones de pago fluidas y transparentes
- Retención de asesores satisfechos con la plataforma

## Positioning

Meti se diferencia por:
- **Modelo de precio justo:** El asesor define cuánto quiere ganar; la plataforma añade un fee transparente, no oculta comisiones
- **Gestión de agenda potente:** Configuración recurrente por día de semana, almuerzos, brechas entre citas, sin límite de citas diarias
- **100% online con chat:** Videollamada integrada + chat de texto persistente durante la asesoría
- **Promociones flexibles:** Los asesores pueden crear descuentos por fechas especiales (porcentaje o monto fijo)
- **Política clara de cancelación:** Reagendar siempre gratis (con anticipación mínima configurable), cancelar sin devolución
- **Modo oscuro:** Tema claro/oscuro con toggle en toda la plataforma

## Operating Context

- **Flujo del cliente:** Buscar → Explorar perfiles → Seleccionar servicio → Elegir fecha/horario → Pagar con Mercado Pago → Unirse a videollamada → Calificar
- **Flujo del asesor:** Registrar → Configurar perfil y credenciales MP → Crear servicios → Definir horarios → (Opcional) Crear promociones → Atender asesorías → Recibir facturación mensual
- **Flujo del admin:** Gestionar asesores → Configurar fees y precios mínimos → Supervisar transacciones → Generar facturas de cobro de fees
- **Pagos:** Mercado Pago Checkout PRO, cada asesor usa sus propias credenciales (modelo sin custodia)
- **Videollamada:** LiveKit Cloud con grabación (Egress a S3) y chat persistente
- **Notificaciones:** Emails de confirmación y recordatorios (Resend) + toasts in-app (Sileo)

## Capabilities and Constraints

**Capacidades confirmadas:**
- Autenticación con Google OAuth **y email/contraseña** (better-auth, con vinculación de cuentas)
- Roles de usuario con control de acceso por área (CLIENT → dashboard, ADVISOR → advisor, ADMIN → admin)
- Primer usuario del sistema se convierte automáticamente en ADMIN
- Múltiples servicios por asesor con duración y precio variable
- Horarios recurrentes por día de semana (configuración por el asesor) + bloques de tiempo
- Generación automática de slots disponibles que bloquean horarios ya reservados
- Booking con confirmación automática al pagar
- Checkout con Mercado Pago (cada asesor registra sus credenciales)
- Videollamada LiveKit con chat de texto persistente y grabación (Egress a S3)
- Sistema de reseñas (rating 1-5 + comentario)
- Promociones por fechas especiales (descuento porcentaje o monto fijo)
- Panel admin con configuración de fees y precios mínimos, verificación de asesores y facturación mensual
- Facturación mensual desglosada de fees para asesores (admin marca pagadas)
- Notificaciones por email (confirmación de pago, nueva reserva, recordatorio 24h antes)
- Toasts in-app con Sileo (feedback de acciones y alerta de nuevas reservas)
- Modo oscuro (toggle en navbar y dashboards)
- Páginas públicas: FAQ, recursos para asesores, historias de éxito, términos, privacidad, cookies, reembolsos

**Restricciones:**
- No se permiten asesorías gratis (tope mínimo configurable por admin)
- El fee es markup (se añade al precio del asesor, no se descuenta)
- Cancelación: reagendar gratis con anticipación mínima (configurable por servicio), cancelar/no-show sin devolución
- Modalidad: 100% online (videollamada obligatoria)
- Pago: solo vía Mercado Pago (sin otros métodos en MVP)
- El descuento de una promoción lo absorbe el asesor (la plataforma mantiene su fee sobre el precio original)

**Decisiones abiertas:**
- Soporte post-MVP: chat en vivo (fuera de la llamada), SMS, push notifications

## Brand Commitments

- **Nombre:** Meti (inspirado en la diosa griega Metis, diosa de la sabiduría y la prudencia)
- **Dominio:** meti.cognilab.dev
- **Tono visual:** Energético / Bold (naranja vibrante + azul oscuro)
- **Voz:** Profesional pero cercana, directa, confiable

## Test Accounts

Cuentas de prueba para QA y automatización (TestSprite). Todas usan la misma contraseña.

| Rol | Email | Password |
|---|---|---|
| **Admin** | edwaramayadiaz@gmail.com | Control2486 |
| **Asesor** | amayadiazedwarorlando@gmail.com | Control2486 |
| **Cliente** | edwarorlandoamayadiaztest@gmail.com | Control2486 |

- **URL principal:** https://meti.cognilab.dev
- **Datos del asesor de prueba:** 2 servicios activos (Consultoría estratégica $100.000 / Planificación financiera $80.000), agenda Lun–Vie 09:00–17:00 (almuerzo 12:00–13:00), perfil verificado
- **Nota:** el asesor aún no tiene credenciales de Mercado Pago conectadas; el checkout mostrará "Pago no disponible" hasta configurarlas

## Test Matrix (TestSprite)

**Flujos públicos (sin login):**
1. Landing: hero, categorías, cómo funciona, CTA
2. Explorar asesores (búsqueda)
3. Perfil de asesor: info, servicios, video (si aplica), calendario
4. Páginas legales: FAQ, recursos, historias, términos, privacidad, cookies, reembolsos
5. Reserva: seleccionar servicio → fecha → hora (slots no disponibles deben ocultarse)

**Flujos autenticados (cliente):**
6. Login con email/contraseña
7. Dashboard: citas (filtros), perfil
8. Booking completo hasta checkout (requiere MP del asesor para pagar)
9. Cerrar sesión

**Flujos autenticados (asesor):**
10. Dashboard con alerta de nuevas reservas (toast)
11. CRUD de servicios (crear, editar, activar/desactivar, eliminar) — feedback con toasts
12. Agenda: vista mes/semana/día/agenda con citas
13. Promociones: crear, activar/desactivar, eliminar
14. Pagos: ver facturas mensuales
15. Configuración Mercado Pago

**Flujos autenticados (admin):**
16. Dashboard con estadísticas
17. Verificación de documentos de asesores
18. Facturación: generar facturas del mes, marcar pagadas
19. Usuarios y configuración de fees

**Controles de acceso:**
20. Cliente NO debe acceder a /advisor ni /admin
21. Asesor NO debe acceder a /admin
22. Admin NO debe acceder a /advisor

## Product Principles

1. **Transparencia total:** El asesor siempre sabe cuánto gana y cuánto cobra la plataforma; el cliente ve el precio final sin sorpresas
2. **Flexibilidad para el asesor:** Control completo sobre servicios, horarios, precios y promociones
3. **Experiencia fluida para el cliente:** Desde buscar hasta agendar y asistir, el proceso debe ser rápido e intuitivo
4. **Escalabilidad sin complejidad:** Modelo sin custodia de pagos que permite crecer sin infraestructura de cobros
5. **Claridad en las reglas:** Políticas de cancelación y reagenda claras desde el primer contacto

## Accessibility & Inclusion

- Interface responsive (desktop y mobile)
- Contraste de colores WCAG AA (en modo claro y oscuro)
- Navegación por teclado
- Textos alternativos en imágenes
- Formularios accesibles con labels y validación clara
