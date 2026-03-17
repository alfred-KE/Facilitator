"use client";

import { useState } from "react";
import type { Interaction, InteractionResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Send, Check } from "lucide-react";

interface ParticipantInteractionProps {
  interaction: Interaction;
  participantId: string;
  participantName: string;
  onRespond: (response: InteractionResponse) => void;
}

export default function ParticipantInteraction({
  interaction,
  participantId,
  participantName,
  onRespond,
}: ParticipantInteractionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [rating, setRating] = useState(0);

  const hasAlreadyResponded = interaction.responses.some(
    (r) => r.participantId === participantId
  );

  if (submitted || hasAlreadyResponded) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <p className="text-lg font-medium text-gray-800">Réponse envoyée !</p>
        <p className="text-sm text-gray-500 mt-1">
          En attente des autres participants...
        </p>
      </div>
    );
  }

  const submit = (value: string) => {
    const response: InteractionResponse = {
      id: uuidv4(),
      participantId,
      participantName,
      value,
      timestamp: new Date().toISOString(),
    };
    onRespond(response);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 text-center">
        {interaction.question}
      </h2>

      {/* Poll / Quiz */}
      {(interaction.type === "poll" || interaction.type === "quiz") &&
        interaction.options && (
          <div className="space-y-3">
            {interaction.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedOption === option.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="font-medium">{option.text}</span>
              </button>
            ))}
            <button
              onClick={() => selectedOption && submit(selectedOption)}
              disabled={!selectedOption}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Valider mon choix
            </button>
          </div>
        )}

      {/* Word cloud / Q&A */}
      {(interaction.type === "wordcloud" || interaction.type === "qa") && (
        <div className="space-y-3">
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={
              interaction.type === "wordcloud"
                ? "Entrez un mot ou une expression..."
                : "Posez votre question..."
            }
            rows={interaction.type === "qa" ? 3 : 1}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
          />
          <button
            onClick={() => textValue.trim() && submit(textValue.trim())}
            disabled={!textValue.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
            Envoyer
          </button>
        </div>
      )}

      {/* Rating */}
      {interaction.type === "rating" && (
        <div className="space-y-6">
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-5xl transition-all ${
                  star <= rating
                    ? "text-yellow-400 scale-110"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <button
            onClick={() => rating > 0 && submit(String(rating))}
            disabled={rating === 0}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Envoyer mon évaluation
          </button>
        </div>
      )}
    </div>
  );
}
