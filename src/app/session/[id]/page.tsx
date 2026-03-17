"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import type { Session, Interaction, InteractionResponse } from "@/types";
import Timer from "@/components/Timer";
import SectionList from "@/components/SectionList";
import InteractionPanel from "@/components/InteractionPanel";
import InteractionResults from "@/components/InteractionResults";
import {
  Users,
  Copy,
  Check,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerTotal, setTimerTotal] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [activeInteraction, setActiveInteraction] =
    useState<Interaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          setSession(data);
          if (data.sections.length > 0) {
            setTimerRemaining(data.sections[0].duration * 60);
            setTimerTotal(data.sections[0].duration * 60);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  // Timer tick
  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timerRemaining]);

  const goToSection = useCallback(
    (index: number) => {
      if (!session || index < 0 || index >= session.sections.length) return;
      setActiveSectionIndex(index);
      const section = session.sections[index];
      setTimerRemaining(section.duration * 60);
      setTimerTotal(section.duration * 60);
      setTimerRunning(false);
      setActiveInteraction(null);
    },
    [session]
  );

  const handleCopyCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLaunchInteraction = (interaction: Interaction) => {
    setActiveInteraction(interaction);
    // Simulate some responses for demo purposes
    simulateResponses(interaction);
  };

  const simulateResponses = (interaction: Interaction) => {
    const names = [
      "Marie",
      "Pierre",
      "Sophie",
      "Thomas",
      "Julie",
      "Lucas",
      "Emma",
      "Hugo",
    ];
    const wordOptions = [
      "innovation",
      "collaboration",
      "agilité",
      "créativité",
      "efficacité",
      "communication",
      "stratégie",
      "digital",
      "équipe",
      "objectif",
      "performance",
      "confiance",
    ];

    let count = 0;
    const interval = setInterval(() => {
      if (count >= 8) {
        clearInterval(interval);
        return;
      }

      const name = names[count % names.length];
      let value = "";

      if (
        interaction.type === "poll" ||
        interaction.type === "quiz"
      ) {
        const options = interaction.options || [];
        if (options.length > 0) {
          value = options[Math.floor(Math.random() * options.length)].id;
        }
      } else if (interaction.type === "wordcloud") {
        value =
          wordOptions[Math.floor(Math.random() * wordOptions.length)];
      } else if (interaction.type === "qa") {
        const questions = [
          "Comment mesurer le ROI ?",
          "Quel est le planning prévu ?",
          "Peut-on avoir plus de détails sur le budget ?",
          "Quelle est la prochaine étape ?",
        ];
        value = questions[Math.floor(Math.random() * questions.length)];
      } else if (interaction.type === "rating") {
        value = String(Math.floor(Math.random() * 3) + 3);
      }

      const response: InteractionResponse = {
        id: `sim-${count}`,
        participantId: `p-${count}`,
        participantName: name,
        value,
        timestamp: new Date().toISOString(),
      };

      setActiveInteraction((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          responses: [...prev.responses, response],
          options: prev.options?.map((opt) =>
            opt.id === value ? { ...opt, votes: opt.votes + 1 } : opt
          ),
        };
      });

      setParticipantCount((prev) => Math.max(prev, count + 1));
      count++;
    }, 1500);

    return () => clearInterval(interval);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Session non trouvée</p>
      </div>
    );
  }

  const activeSection = session.sections[activeSectionIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{session.title}</h1>
              <p className="text-xs text-gray-500">
                {session.sections.length} sections &middot;{" "}
                {session.totalDuration} min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Participant count */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{participantCount}</span>
            </div>

            {/* Access code */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <span className="font-mono font-bold text-primary-700 tracking-widest">
                {session.accessCode}
              </span>
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-primary-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar - Section list */}
        <aside className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto hidden lg:block">
          <SectionList
            sections={session.sections}
            activeSectionIndex={activeSectionIndex}
            onSectionClick={goToSection}
          />
        </aside>

        {/* Center - Timer + Instructions */}
        <main className="flex-1 flex flex-col items-center px-6 py-8 overflow-y-auto">
          {/* Section navigation */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => goToSection(activeSectionIndex - 1)}
              disabled={activeSectionIndex === 0}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">
              Section {activeSectionIndex + 1} / {session.sections.length}
            </span>
            <button
              onClick={() => goToSection(activeSectionIndex + 1)}
              disabled={activeSectionIndex === session.sections.length - 1}
              className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Timer */}
          <Timer
            remaining={timerRemaining}
            total={timerTotal}
            isRunning={timerRunning}
            onToggle={() => setTimerRunning(!timerRunning)}
            onReset={() => {
              setTimerRemaining(activeSection.duration * 60);
              setTimerRunning(false);
            }}
            onSkip={
              activeSectionIndex < session.sections.length - 1
                ? () => goToSection(activeSectionIndex + 1)
                : undefined
            }
            sectionTitle={activeSection.title}
          />

          {/* Instructions */}
          <div className="mt-8 w-full max-w-2xl">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Consignes facilitateur
              </h3>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {activeSection.instructions || activeSection.description || "Aucune consigne spécifique pour cette section."}
              </div>
            </div>
          </div>

          {/* Mobile section list */}
          <div className="mt-6 w-full max-w-2xl lg:hidden">
            <SectionList
              sections={session.sections}
              activeSectionIndex={activeSectionIndex}
              onSectionClick={goToSection}
            />
          </div>
        </main>

        {/* Right panel - Interactions */}
        <aside className="w-96 bg-white border-l border-gray-200 p-4 overflow-y-auto hidden xl:block">
          {activeInteraction ? (
            <InteractionResults
              interaction={activeInteraction}
              onClose={() => setActiveInteraction(null)}
            />
          ) : (
            <InteractionPanel
              sectionId={activeSection.id}
              onLaunch={handleLaunchInteraction}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
