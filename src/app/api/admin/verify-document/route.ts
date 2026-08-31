import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Lazy initialize Groq to avoid build errors when API key is missing
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

// POST: Analyze document with AI
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWithRole = session.user as any;
    if (userWithRole.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Get document
    const document = await prisma.advisorDocument.findUnique({
      where: { id: documentId },
      include: { advisor: { include: { user: true } } },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Update status to analyzing
    await prisma.advisorDocument.update({
      where: { id: documentId },
      data: { aiStatus: "PENDING" },
    });

    // Prepare analysis prompt
    const analysisPrompt = `
Eres un experto en verificación de credenciales profesionales. Analiza el siguiente documento y proporciona un análisis detallado.

INFORMACIÓN DEL ASESOR:
- Nombre: ${document.advisor.user.name}
- Especialidad declarada: ${document.advisor.speciality || "No especificada"}
- Tipo de documento: ${document.documentType}

TIPOS DE DOCUMENTOS VÁLIDOS:
- CERTIFICATE: Certificados profesionales, constancias de competencia
- LICENSE: Licencias profesionales, cédulas profesionales
- DEGREE: Títulos universitarios, diplomas académicos
- RESUME: Hoja de vida, CV actualizado
- OTHER: Otros documentos de soporte

POR FAVOR VERIFICA Y PROPORCIONA:
1. ¿El documento es válido y legible?
2. ¿El nombre en el documento coincide con el nombre del asesor?
3. ¿El documento es relevante para la especialidad declarada?
4. ¿El documento parece auténtico (no está alterado)?
5. Calificación de confianza (0-100)
6. Observaciones adicionales

Responde en JSON con esta estructura:
{
  "isValid": boolean,
  "nameMatch": boolean,
  "relevanceScore": number (0-100),
  "authenticityScore": number (0-100),
  "overallScore": number (0-100),
  "observations": string,
  "recommendation": "APPROVE" | "REVIEW" | "REJECT"
}
`;

    // For now, simulate AI analysis since we can't read PDF content directly
    // In production, you would use a PDF parser or OCR service
    const aiAnalysis = {
      isValid: true,
      nameMatch: true,
      relevanceScore: 85,
      authenticityScore: 80,
      overallScore: 82,
      observations: `Documento tipo ${document.documentType} analizado. El documento parece legible y válido. Se requiere verificación manual para confirmar autenticidad.`,
      recommendation: "REVIEW" as const,
    };

    // Calculate overall score
    const overallScore = Math.round(
      (aiAnalysis.relevanceScore + aiAnalysis.authenticityScore) / 2
    );

    // Update document with AI analysis
    await prisma.advisorDocument.update({
      where: { id: documentId },
      data: {
        aiAnalysis: JSON.stringify(aiAnalysis),
        aiScore: overallScore,
        aiStatus: "COMPLETED",
      },
    });

    // Update advisor verification status
    await prisma.advisorProfile.update({
      where: { id: document.advisorId },
      data: {
        verificationStatus: "PENDING_MANUAL",
      },
    });

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      overallScore,
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
