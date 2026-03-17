import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { saveSession, getAllSessions } from "@/lib/session-store";
import type { Session, SessionSection } from "@/types";

function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, sections } = body as {
      title: string;
      description: string;
      sections: SessionSection[];
    };

    if (!title || !sections || sections.length === 0) {
      return NextResponse.json(
        { error: "Titre et sections requis" },
        { status: 400 }
      );
    }

    const session: Session = {
      id: uuidv4(),
      title,
      description: description || "",
      sections,
      createdAt: new Date().toISOString(),
      totalDuration: sections.reduce((acc, s) => acc + s.duration, 0),
      accessCode: generateAccessCode(),
    };

    saveSession(session);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const sessions = getAllSessions();
  return NextResponse.json(sessions);
}
