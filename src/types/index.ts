export interface SessionSection {
  id: string;
  title: string;
  description: string;
  instructions: string;
  duration: number; // in minutes
  type: "presentation" | "workshop" | "break" | "discussion" | "interaction";
  interaction?: Interaction;
  order: number;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  sections: SessionSection[];
  createdAt: string;
  totalDuration: number;
  accessCode: string;
}

export type InteractionType = "poll" | "wordcloud" | "quiz" | "qa" | "rating";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Interaction {
  id: string;
  type: InteractionType;
  question: string;
  options?: PollOption[];
  responses: InteractionResponse[];
  isActive: boolean;
  sectionId: string;
}

export interface InteractionResponse {
  id: string;
  participantId: string;
  participantName: string;
  value: string;
  timestamp: string;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface TimerState {
  sectionId: string;
  remaining: number; // in seconds
  isRunning: boolean;
  totalSeconds: number;
}

export interface AIAnalysis {
  summary: string;
  suggestions: string[];
  optimizedSections: SessionSection[];
  estimatedEngagement: number;
}
