import { create } from "zustand";
import type {
  Session,
  SessionSection,
  Interaction,
  InteractionResponse,
  Participant,
  TimerState,
} from "@/types";

interface AppState {
  // Sessions
  sessions: Session[];
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  addSession: (session: Session) => void;

  // Active section
  activeSectionIndex: number;
  setActiveSectionIndex: (index: number) => void;

  // Timer
  timer: TimerState | null;
  setTimer: (timer: TimerState | null) => void;
  tickTimer: () => void;

  // Interactions
  activeInteraction: Interaction | null;
  setActiveInteraction: (interaction: Interaction | null) => void;
  addResponse: (response: InteractionResponse) => void;

  // Participants
  participants: Participant[];
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  sessions: [],
  currentSession: null,
  setCurrentSession: (session) => set({ currentSession: session }),
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),

  activeSectionIndex: 0,
  setActiveSectionIndex: (index) => set({ activeSectionIndex: index }),

  timer: null,
  setTimer: (timer) => set({ timer }),
  tickTimer: () =>
    set((state) => {
      if (!state.timer || !state.timer.isRunning || state.timer.remaining <= 0)
        return state;
      return {
        timer: { ...state.timer, remaining: state.timer.remaining - 1 },
      };
    }),

  activeInteraction: null,
  setActiveInteraction: (interaction) =>
    set({ activeInteraction: interaction }),
  addResponse: (response) =>
    set((state) => {
      if (!state.activeInteraction) return state;
      return {
        activeInteraction: {
          ...state.activeInteraction,
          responses: [...state.activeInteraction.responses, response],
          options: state.activeInteraction.options?.map((opt) =>
            opt.id === response.value
              ? { ...opt, votes: opt.votes + 1 }
              : opt
          ),
        },
      };
    }),

  participants: [],
  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),
  removeParticipant: (id) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    })),
}));
