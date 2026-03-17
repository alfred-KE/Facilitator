import { NextRequest, NextResponse } from "next/server";
import { analyzeAgenda } from "@/lib/ai-analyze";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawText, title } = body;

    if (!rawText || !title) {
      return NextResponse.json(
        { error: "Le titre et le contenu sont requis" },
        { status: 400 }
      );
    }

    const { analysis, sections } = analyzeAgenda(rawText, title);

    return NextResponse.json({ analysis, sections });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse" },
      { status: 500 }
    );
  }
}
