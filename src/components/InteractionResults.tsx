"use client";

import { useMemo } from "react";
import type { Interaction } from "@/types";
import { X, Users } from "lucide-react";

interface InteractionResultsProps {
  interaction: Interaction;
  onClose: () => void;
}

export default function InteractionResults({
  interaction,
  onClose,
}: InteractionResultsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {interaction.question}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {interaction.responses.length} réponse(s)
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {interaction.type === "poll" || interaction.type === "quiz" ? (
        <PollResults interaction={interaction} />
      ) : interaction.type === "wordcloud" ? (
        <WordCloudResults interaction={interaction} />
      ) : interaction.type === "qa" ? (
        <QAResults interaction={interaction} />
      ) : interaction.type === "rating" ? (
        <RatingResults interaction={interaction} />
      ) : null}
    </div>
  );
}

function PollResults({ interaction }: { interaction: Interaction }) {
  const totalVotes =
    interaction.options?.reduce((acc, o) => acc + o.votes, 0) || 0;

  const colors = [
    "bg-primary-500",
    "bg-orange-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-cyan-500",
  ];

  return (
    <div className="space-y-3">
      {interaction.options?.map((option, index) => {
        const percentage =
          totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        return (
          <div key={option.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{option.text}</span>
              <span className="text-gray-500">
                {option.votes} ({percentage}%)
              </span>
            </div>
            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`h-full ${colors[index % colors.length]} rounded-lg transition-all duration-700 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WordCloudResults({ interaction }: { interaction: Interaction }) {
  const wordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    interaction.responses.forEach((r) => {
      const word = r.value.toLowerCase().trim();
      counts[word] = (counts[word] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30);
  }, [interaction.responses]);

  const maxCount = wordCounts.length > 0 ? wordCounts[0][1] : 1;

  const colors = [
    "text-primary-600",
    "text-orange-500",
    "text-green-600",
    "text-purple-600",
    "text-pink-500",
    "text-cyan-600",
    "text-red-500",
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center py-6 min-h-[200px]">
      {wordCounts.length === 0 ? (
        <p className="text-gray-400 text-sm">
          En attente des réponses des participants...
        </p>
      ) : (
        wordCounts.map(([word, count], index) => {
          const scale = 0.8 + (count / maxCount) * 1.5;
          return (
            <span
              key={word}
              className={`font-bold ${colors[index % colors.length]} transition-all duration-500`}
              style={{
                fontSize: `${scale}rem`,
                opacity: 0.6 + (count / maxCount) * 0.4,
              }}
            >
              {word}
            </span>
          );
        })
      )}
    </div>
  );
}

function QAResults({ interaction }: { interaction: Interaction }) {
  return (
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {interaction.responses.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          En attente des questions...
        </p>
      ) : (
        interaction.responses.map((response) => (
          <div
            key={response.id}
            className="p-3 bg-gray-50 rounded-xl border border-gray-100"
          >
            <p className="text-gray-800">{response.value}</p>
            <p className="text-xs text-gray-400 mt-1">
              {response.participantName}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

function RatingResults({ interaction }: { interaction: Interaction }) {
  const ratings = interaction.responses.map((r) => parseInt(r.value) || 0);
  const average =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "–";

  const distribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: ratings.filter((r) => r === star).length,
  }));

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <span className="text-5xl font-bold text-primary-600">{average}</span>
        <span className="text-2xl text-gray-400">/5</span>
        <p className="text-sm text-gray-500 mt-1">
          {ratings.length} évaluation(s)
        </p>
      </div>
      <div className="space-y-2">
        {distribution.reverse().map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-sm w-4 text-gray-500">{star}</span>
            <span className="text-yellow-500">★</span>
            <div className="flex-1 h-5 bg-gray-100 rounded">
              <div
                className="h-full bg-yellow-400 rounded transition-all duration-500"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm text-gray-500 w-8">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
