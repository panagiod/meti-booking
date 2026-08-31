import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Lazy initialize Groq
let groq: any = null;

function getGroqClient() {
  if (!groq && process.env.GROQ_API_KEY) {
    const Groq = require("groq-sdk").default;
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

// POST: Generar resumen de la asesoría con IA
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: "La transcripción es muy corta para generar un resumen" },
        { status: 400 }
      );
    }

    // Verificar que la cita existe y el usuario es participante
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        advisor: { include: { user: true } },
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    const userId = session.user.id;
    const isAdvisor = appointment.advisor.userId === userId;
    const isClient = appointment.clientId === userId;

    if (!isAdvisor && !isClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generar resumen con Groq
    const groqClient = getGroqClient();
    if (!groqClient) {
      return NextResponse.json(
        { error: "Servicio de IA no configurado" },
        { status: 501 }
      );
    }

    const prompt = `Eres un asistente profesional que genera resúmenes de asesorías. 

Analiza la siguiente transcripción de una asesoría de "${appointment.service.name}" entre el asesor "${appointment.advisor.user.name}" y el cliente "${appointment.client.name}".

Genera un resumen estructurado en español con:

1. **Tema principal**: En una línea corta
2. **Puntos clave**: Lista de 3-7 puntos más importantes discutidos
3. **Decisiones o acuerdos**: Si hubo decisiones tomadas
4. **Próximos pasos**: Si se mencionaron acciones a realizar
5. **Notas adicionales**: Cualquier otro dato relevante

Transcripción:
${transcript}

Resumen:`;

    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente profesional que genera resúmenes concisos y estructurados de asesorías. Responde siempre en español.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content;

    if (!summary) {
      return NextResponse.json(
        { error: "No se pudo generar el resumen" },
        { status: 500 }
      );
    }

    // Guardar en la base de datos
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        transcript: transcript,
        summary: summary,
      },
    });

    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Error al generar el resumen" },
      { status: 500 }
    );
  }
}
