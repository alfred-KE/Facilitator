import type { Session } from "@/types";

// In-memory session store (server-side)
// In production, this would be a database
const sessions = new Map<string, Session>();

export function saveSession(session: Session): void {
  sessions.set(session.id, session);
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function getAllSessions(): Session[] {
  return Array.from(sessions.values());
}

export function deleteSession(id: string): boolean {
  return sessions.delete(id);
}

export function getSessionByCode(code: string): Session | undefined {
  return Array.from(sessions.values()).find((s) => s.accessCode === code);
}
