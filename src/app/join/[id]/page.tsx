"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Session, Interaction, InteractionResponse } from "@/types";
import ParticipantInteraction from "@/components/ParticipantInteraction";
import { v4 as uuidv4 } from "uuid";
import { Zap, Clock, User, Loader2 } from "lucide-react";

export default function JoinPage() {
  const params = useParams();
  const code = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantName, setParticipantName] = useState("");
  const [participantId] = useState(() => uuidv4());
  const [joined, setJoined] = useState(false);
  const [activeInteraction, setActiveInteraction] =
    useState<Interaction | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/sessions/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          setSession(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [code]);

  const handleJoin = () => {
    if (participantName.trim()) {
      setJoined(true);
    }
  };

  const handleRespond = (response: InteractionResponse) => {
    setActiveInteraction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        responses: [...prev.responses, response],
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-800 mb-2">
            Session non trouvée
          </p>
          <p className="text-gray-500">
            Vérifiez le code d&apos;accès: {code}
          </p>
        </div>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {session.title}
            </h1>
            <p className="text-gray-500 mt-1">
              {session.sections.length} sections &middot;{" "}
              {session.totalDuration} min
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Votre prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Entrez votre prénom"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
              </div>
            </div>

            <button
              onClick={handleJoin}
              disabled={!participantName.trim()}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Rejoindre la session
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSection = session.sections[currentSectionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              {session.title}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Bonjour, {participantName}
          </span>
        </div>
      </header>

      {/* Current section info */}
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Clock className="w-4 h-4" />
            <span>
              Section {currentSectionIndex + 1} /{" "}
              {session.sections.length}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {currentSection.title}
          </h2>
          {currentSection.description && (
            <p className="text-gray-600 mt-2">{currentSection.description}</p>
          )}
        </div>

        {/* Active interaction */}
        {activeInteraction ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <ParticipantInteraction
              interaction={activeInteraction}
              participantId={participantId}
              participantName={participantName}
              onRespond={handleRespond}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">
              En attente de la prochaine activité...
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Le facilitateur lancera les interactions
            </p>
          </div>
        )}

        {/* Section navigator for participant */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Programme
          </h3>
          <div className="space-y-2">
            {session.sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-3 rounded-xl border ${
                  index === currentSectionIndex
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium text-sm ${
                      index === currentSectionIndex
                        ? "text-primary-900"
                        : "text-gray-700"
                    }`}
                  >
                    {section.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {section.duration} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
