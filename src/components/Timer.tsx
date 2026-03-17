"use client";

import { useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";

interface TimerProps {
  remaining: number;
  total: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onSkip?: () => void;
  sectionTitle: string;
}

export default function Timer({
  remaining,
  total,
  isRunning,
  onToggle,
  onReset,
  onSkip,
  sectionTitle,
}: TimerProps) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;
  const isWarning = remaining < 60 && remaining > 0;
  const isExpired = remaining <= 0;

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = useCallback(() => {
    if (isExpired) return "text-red-500";
    if (isWarning) return "text-orange-500";
    return "text-primary-600";
  }, [isExpired, isWarning]);

  const getStrokeColor = useCallback(() => {
    if (isExpired) return "#ef4444";
    if (isWarning) return "#f97316";
    return "#4c6ef5";
  }, [isExpired, isWarning]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        {sectionTitle}
      </p>

      {/* Circular timer */}
      <div className="relative w-56 h-56">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${
            isWarning && isRunning ? "animate-pulse-ring" : ""
          }`}
        >
          <span className={`text-5xl font-bold tabular-nums ${getColor()}`}>
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-sm text-gray-400 mt-1">
            {isExpired ? "Temps écoulé" : isRunning ? "En cours" : "En pause"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Réinitialiser"
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={onToggle}
          className={`p-4 rounded-full text-white transition-colors ${
            isRunning
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-primary-600 hover:bg-primary-700"
          }`}
          title={isRunning ? "Pause" : "Démarrer"}
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Section suivante"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
