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

// POST: Generate consultation summary with AI
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
        { error: "The transcript is too short to generate a summary" },
        { status: 400 }
      );
    }

    // Verify the appointment exists and the user is a participant
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        instructor: { include: { user: true } },
        client: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isAdvisor = appointment.instructor.userId === userId;
    const isClient = appointment.clientId === userId;

    if (!isAdvisor && !isClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate summary with Groq
    const groqClient = getGroqClient();
    if (!groqClient) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 501 }
      );
    }

    const prompt = `You are a professional assistant that generates consultation summaries.

Analyze the following transcript of a "${appointment.service.name}" consultation between advisor "${appointment.instructor.user.name}" and client "${appointment.client.name}".

Generate a structured summary in English with:

1. **Main topic**: In one short line
2. **Key points**: List of 3-7 most important points discussed
3. **Decisions or agreements**: If any decisions were made
4. **Next steps**: If any actions to take were mentioned
5. **Additional notes**: Any other relevant details

Transcript:
${transcript}

Summary:`;

    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a professional assistant that generates concise, structured consultation summaries. Always respond in English.",
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
        { error: "Could not generate the summary" },
        { status: 500 }
      );
    }

    // Save to the database
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
      { error: "Error generating summary" },
      { status: 500 }
    );
  }
}
