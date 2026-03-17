"use client";

import type { SessionSection } from "@/types";
import {
  Presentation,
  Wrench,
  Coffee,
  MessageSquare,
  Zap,
  Clock,
  ChevronRight,
} from "lucide-react";

interface SectionListProps {
  sections: SessionSection[];
  activeSectionIndex: number;
  onSectionClick: (index: number) => void;
}

const typeIcons: Record<SessionSection["type"], React.ReactNode> = {
  presentation: <Presentation className="w-5 h-5" />,
  workshop: <Wrench className="w-5 h-5" />,
  break: <Coffee className="w-5 h-5" />,
  discussion: <MessageSquare className="w-5 h-5" />,
  interaction: <Zap className="w-5 h-5" />,
};

const typeColors: Record<SessionSection["type"], string> = {
  presentation: "bg-blue-100 text-blue-700 border-blue-200",
  workshop: "bg-purple-100 text-purple-700 border-purple-200",
  break: "bg-green-100 text-green-700 border-green-200",
  discussion: "bg-yellow-100 text-yellow-700 border-yellow-200",
  interaction: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function SectionList({
  sections,
  activeSectionIndex,
  onSectionClick,
}: SectionListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Déroulé
      </h3>
      {sections.map((section, index) => {
        const isActive = index === activeSectionIndex;
        const isPast = index < activeSectionIndex;

        return (
          <button
            key={section.id}
            onClick={() => onSectionClick(index)}
            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
              isActive
                ? "border-primary-500 bg-primary-50 shadow-md"
                : isPast
                  ? "border-gray-200 bg-gray-50 opacity-60"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${typeColors[section.type]}`}
              >
                {typeIcons[section.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium truncate ${
                    isActive ? "text-primary-900" : "text-gray-800"
                  }`}
                >
                  {section.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {section.duration} min
                  </span>
                </div>
              </div>
              {isActive && (
                <ChevronRight className="w-5 h-5 text-primary-500 flex-shrink-0" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
