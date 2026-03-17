import { NextRequest, NextResponse } from "next/server";
import { getSession, getSessionByCode } from "@/lib/session-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Try by ID first, then by access code
  let session = getSession(id);
  if (!session) {
    session = getSessionByCode(id);
  }

  if (!session) {
    return NextResponse.json(
      { error: "Session non trouvée" },
      { status: 404 }
    );
  }

  return NextResponse.json(session);
}
