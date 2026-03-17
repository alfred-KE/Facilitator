"use client";

import { useState } from "react";
import type { Interaction, InteractionType, PollOption } from "@/types";
import { v4 as uuidv4 } from "uuid";
import {
  BarChart3,
  Cloud,
  HelpCircle,
  Brain,
  Star,
  Plus,
  Trash2,
  Send,
} from "lucide-react";

interface InteractionPanelProps {
  onLaunch: (interaction: Interaction) => void;
  sectionId: string;
}

const interactionTypes: {
  type: InteractionType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    type: "poll",
    label: "Sondage",
    icon: <BarChart3 className="w-6 h-6" />,
    description: "Posez une question à choix multiples",
  },
  {
    type: "wordcloud",
    label: "Nuage de mots",
    icon: <Cloud className="w-6 h-6" />,
    description: "Collectez des mots-clés des participants",
  },
  {
    type: "qa",
    label: "Questions / Réponses",
    icon: <HelpCircle className="w-6 h-6" />,
    description: "Ouvrez un espace de questions",
  },
  {
    type: "quiz",
    label: "Quiz",
    icon: <Brain className="w-6 h-6" />,
    description: "Testez les connaissances",
  },
  {
    type: "rating",
    label: "Évaluation",
    icon: <Star className="w-6 h-6" />,
    description: "Demandez une note de 1 à 5",
  },
];

export default function InteractionPanel({
  onLaunch,
  sectionId,
}: InteractionPanelProps) {
  const [selectedType, setSelectedType] = useState<InteractionType | null>(
    null
  );
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { id: uuidv4(), text: "", votes: 0 },
    { id: uuidv4(), text: "", votes: 0 },
  ]);

  const needsOptions = selectedType === "poll" || selectedType === "quiz";

  const addOption = () => {
    setOptions([...options, { id: uuidv4(), text: "", votes: 0 }]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((o) => o.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleLaunch = () => {
    if (!selectedType || !question.trim()) return;

    const interaction: Interaction = {
      id: uuidv4(),
      type: selectedType,
      question: question.trim(),
      options: needsOptions ? options.filter((o) => o.text.trim()) : undefined,
      responses: [],
      isActive: true,
      sectionId,
    };

    onLaunch(interaction);
    setQuestion("");
    setSelectedType(null);
    setOptions([
      { id: uuidv4(), text: "", votes: 0 },
      { id: uuidv4(), text: "", votes: 0 },
    ]);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Lancer une interaction
      </h3>

      {/* Type selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {interactionTypes.map((it) => (
          <button
            key={it.type}
            onClick={() => setSelectedType(it.type)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              selectedType === it.type
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={
                  selectedType === it.type
                    ? "text-primary-600"
                    : "text-gray-500"
                }
              >
                {it.icon}
              </span>
            </div>
            <p className="text-sm font-medium">{it.label}</p>
          </button>
        ))}
      </div>

      {/* Question input */}
      {selectedType && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Votre question..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Options for polls/quizzes */}
          {needsOptions && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-6">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  />
                  <button
                    onClick={() => removeOption(option.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-1"
              >
                <Plus className="w-4 h-4" /> Ajouter une option
              </button>
            </div>
          )}

          {/* Launch button */}
          <button
            onClick={handleLaunch}
            disabled={!question.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            Lancer l&apos;interaction
          </button>
        </div>
      )}
    </div>
  );
}
