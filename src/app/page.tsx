"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Plus,
} from "lucide-react";
import type { AIAnalysis, SessionSection } from "@/types";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "analysis" | "review">("input");
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [sections, setSections] = useState<SessionSection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!title.trim() || !rawText.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, title }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setSections(data.sections);
      setStep("analysis");
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: analysis?.summary || "",
          sections,
        }),
      });
      const session = await res.json();
      router.push(`/session/${session.id}`);
    } catch (error) {
      console.error("Create session failed:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      router.push(`/join/${joinCode.trim().toUpperCase()}`);
    }
  };

  const updateSection = (id: string, updates: Partial<SessionSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const addSection = () => {
    const newSection: SessionSection = {
      id: uuidv4(),
      title: "Nouvelle section",
      description: "",
      instructions: "",
      duration: 15,
      type: "presentation",
      order: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const exampleAgenda = `9h00 - 9h15 : Accueil et ice-breaker (15 min)
Tour de table rapide, présentation des objectifs

9h15 - 9h45 : Présentation du contexte (30 min)
État des lieux, chiffres clés, enjeux

9h45 - 10h30 : Atelier en sous-groupes (45 min)
Brainstorming sur les solutions possibles
Chaque groupe travaille sur un axe différent

10h30 - 10h45 : Pause café (15 min)

10h45 - 11h15 : Restitution et discussion (30 min)
Chaque groupe présente ses idées
Discussion collective

11h15 - 11h45 : Sondage et priorisation (30 min)
Vote sur les propositions
Classement par priorité

11h45 - 12h00 : Synthèse et prochaines étapes (15 min)
Plan d'action
Évaluation de la session`;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="gradient-bg text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Facilitator</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl">
            Créez des sessions de facilitation interactives. Poussez votre
            déroulé, l&apos;IA l&apos;analyse, et guidez vos participants avec
            timer et interactions en live.
          </p>

          {/* Quick join */}
          <div className="mt-8 flex items-center gap-3">
            <div className="glass rounded-xl flex items-center">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Code d'accès"
                maxLength={6}
                className="px-4 py-3 bg-transparent text-white placeholder-white/50 outline-none w-36 font-mono text-lg tracking-widest uppercase"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-r-xl transition-colors disabled:opacity-50"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <span className="text-white/60 text-sm">
              Rejoindre une session
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              icon: <Upload className="w-5 h-5" />,
              title: "1. Poussez",
              desc: "Collez votre déroulé",
            },
            {
              icon: <Sparkles className="w-5 h-5" />,
              title: "2. Analysez",
              desc: "L'IA structure votre session",
            },
            {
              icon: <Clock className="w-5 h-5" />,
              title: "3. Guidez",
              desc: "Timer et consignes en live",
            },
            {
              icon: <Users className="w-5 h-5" />,
              title: "4. Interagissez",
              desc: "Sondages, nuage de mots...",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-xl border border-gray-200 flex items-start gap-3"
            >
              <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{f.title}</p>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Step: Input */}
        {step === "input" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Créer une nouvelle session
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la session
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Atelier stratégie Q2 2025"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Déroulé de la session
                  </label>
                  <button
                    onClick={() => {
                      setRawText(exampleAgenda);
                      setTitle(title || "Atelier collaboratif");
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Charger un exemple
                  </button>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Collez ici votre déroulé...\n\nExemple:\n9h00 - 9h30 : Introduction (30 min)\n9h30 - 10h00 : Atelier brainstorming (30 min)\n...`}
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none font-mono text-sm"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!title.trim() || !rawText.trim() || isAnalyzing}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyser avec l&apos;IA
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: Analysis results */}
        {step === "analysis" && analysis && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Analyse de votre session
              </h2>
              <button
                onClick={() => setStep("input")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Modifier le déroulé
              </button>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
              <h3 className="font-semibold text-primary-900 mb-2">
                Résumé de l&apos;analyse
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {analysis.summary}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Engagement estimé:
                </span>
                <div className="flex-1 max-w-xs h-3 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${analysis.estimatedEngagement}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-primary-700">
                  {analysis.estimatedEngagement}%
                </span>
              </div>
            </div>

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="font-semibold text-amber-900 mb-3">
                  Suggestions d&apos;amélioration
                </h3>
                <ul className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="text-gray-700">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Editable sections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sections ({sections.length})
                </h3>
                <button
                  onClick={addSection}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4" /> Ajouter une section
                </button>
              </div>

              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === section.id ? null : section.id
                        )
                      }
                    >
                      <span className="text-sm px-2 py-0.5 bg-gray-100 rounded text-gray-600 capitalize">
                        {section.type}
                      </span>
                      <span className="font-medium flex-1">
                        {section.title}
                      </span>
                      <span className="text-sm text-gray-500">
                        {section.duration} min
                      </span>
                      {expandedSection === section.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    {expandedSection === section.id && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500">
                              Titre
                            </label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  title: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                            />
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">
                                Durée (min)
                              </label>
                              <input
                                type="number"
                                value={section.duration}
                                onChange={(e) =>
                                  updateSection(section.id, {
                                    duration: parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">
                                Type
                              </label>
                              <select
                                value={section.type}
                                onChange={(e) =>
                                  updateSection(section.id, {
                                    type: e.target
                                      .value as SessionSection["type"],
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                              >
                                <option value="presentation">
                                  Présentation
                                </option>
                                <option value="workshop">Atelier</option>
                                <option value="discussion">Discussion</option>
                                <option value="interaction">Interaction</option>
                                <option value="break">Pause</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">
                            Description
                          </label>
                          <textarea
                            value={section.description}
                            onChange={(e) =>
                              updateSection(section.id, {
                                description: e.target.value,
                              })
                            }
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create session */}
            <button
              onClick={handleCreateSession}
              disabled={sections.length === 0 || isCreating}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Créer la session et commencer
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
