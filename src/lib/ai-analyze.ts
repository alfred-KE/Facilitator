import { v4 as uuidv4 } from "uuid";
import type { AIAnalysis, SessionSection } from "@/types";

/**
 * Analyzes a raw agenda text and generates structured session sections.
 * This uses heuristic parsing. Can be replaced with an actual LLM API call.
 */
export function analyzeAgenda(
  rawText: string,
  title: string
): { analysis: AIAnalysis; sections: SessionSection[] } {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sections: SessionSection[] = [];
  let currentSection: Partial<SessionSection> | null = null;
  let order = 0;

  for (const line of lines) {
    // Detect section headers (lines starting with #, numbers, or time patterns)
    const timeMatch = line.match(
      /^(\d{1,2}[h:]\d{0,2})\s*[-–—]?\s*(\d{1,2}[h:]\d{0,2})?\s*[-–—:]?\s*(.+)/i
    );
    const headerMatch = line.match(/^(?:#{1,3}\s+|\d+[.)]\s+|[-*]\s+)(.+)/);
    const durationMatch = line.match(/\((\d+)\s*(?:min|minutes?|mn)\)/i);

    if (timeMatch || headerMatch) {
      // Save previous section
      if (currentSection && currentSection.title) {
        sections.push(finalizeSection(currentSection, order++));
      }

      const sectionTitle = timeMatch ? timeMatch[3] : headerMatch![1];
      let duration = 15; // default

      if (durationMatch) {
        duration = parseInt(durationMatch[1]);
      } else if (timeMatch && timeMatch[2]) {
        duration = estimateDuration(timeMatch[1], timeMatch[2]);
      }

      currentSection = {
        id: uuidv4(),
        title: sectionTitle.replace(/\(.*?\)/g, "").trim(),
        description: "",
        instructions: "",
        duration,
        type: detectSectionType(sectionTitle),
      };
    } else if (currentSection) {
      // Add as description to current section
      currentSection.description =
        (currentSection.description || "") + line + "\n";
    } else {
      // First content without header - create a section
      currentSection = {
        id: uuidv4(),
        title: line.substring(0, 80),
        description: "",
        instructions: "",
        duration: 15,
        type: "presentation",
      };
    }
  }

  // Don't forget the last section
  if (currentSection && currentSection.title) {
    sections.push(finalizeSection(currentSection, order++));
  }

  // If no sections were parsed, create a single one
  if (sections.length === 0) {
    sections.push({
      id: uuidv4(),
      title: title || "Session principale",
      description: rawText,
      instructions:
        "Suivez le déroulé prévu. Adaptez le rythme selon les participants.",
      duration: 60,
      type: "workshop",
      order: 0,
    });
  }

  // Generate instructions for each section
  for (const section of sections) {
    section.instructions = generateInstructions(section);
  }

  const analysis: AIAnalysis = {
    summary: generateSummary(title, sections),
    suggestions: generateSuggestions(sections),
    optimizedSections: sections,
    estimatedEngagement: Math.min(
      95,
      60 + sections.filter((s) => s.type === "interaction").length * 10
    ),
  };

  return { analysis, sections };
}

function finalizeSection(
  partial: Partial<SessionSection>,
  order: number
): SessionSection {
  return {
    id: partial.id || uuidv4(),
    title: partial.title || "Section sans titre",
    description: (partial.description || "").trim(),
    instructions: partial.instructions || "",
    duration: partial.duration || 15,
    type: partial.type || "presentation",
    order,
  };
}

function detectSectionType(
  title: string
): SessionSection["type"] {
  const lower = title.toLowerCase();
  if (/pause|break|café|coffee/i.test(lower)) return "break";
  if (/atelier|workshop|exercice|activité|hands.?on/i.test(lower))
    return "workshop";
  if (/discussion|échange|débat|q&a|questions/i.test(lower))
    return "discussion";
  if (
    /sondage|poll|vote|quiz|nuage|wordcloud|interaction|ice.?breaker/i.test(
      lower
    )
  )
    return "interaction";
  return "presentation";
}

function estimateDuration(start: string, end: string): number {
  const toMinutes = (t: string) => {
    const parts = t.replace("h", ":").split(":");
    return parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0);
  };
  const diff = toMinutes(end) - toMinutes(start);
  return diff > 0 ? diff : 15;
}

function generateInstructions(section: SessionSection): string {
  const typeInstructions: Record<SessionSection["type"], string> = {
    presentation: `📋 PRÉSENTATION: "${section.title}"\n\n` +
      `• Présentez les points clés de manière claire et concise\n` +
      `• Gardez un rythme dynamique pour maintenir l'attention\n` +
      `• Prévoyez 2-3 minutes pour les questions à la fin\n` +
      (section.description ? `\nContenu prévu:\n${section.description}` : ""),

    workshop: `🔧 ATELIER: "${section.title}"\n\n` +
      `• Expliquez clairement l'objectif et les consignes (2 min)\n` +
      `• Formez des groupes si nécessaire\n` +
      `• Circulez entre les groupes pour accompagner\n` +
      `• Prévoyez un temps de restitution\n` +
      (section.description ? `\nContenu prévu:\n${section.description}` : ""),

    break: `☕ PAUSE: "${section.title}"\n\n` +
      `• Invitez les participants à se détendre\n` +
      `• Rappelez l'heure de reprise\n` +
      `• Profitez-en pour préparer la suite`,

    discussion: `💬 DISCUSSION: "${section.title}"\n\n` +
      `• Lancez la discussion avec une question ouverte\n` +
      `• Assurez-vous que chacun puisse s'exprimer\n` +
      `• Prenez des notes des points clés\n` +
      `• Synthétisez avant de passer à la suite\n` +
      (section.description ? `\nThèmes prévus:\n${section.description}` : ""),

    interaction: `🎯 INTERACTION: "${section.title}"\n\n` +
      `• Lancez l'activité interactive depuis le panneau de contrôle\n` +
      `• Assurez-vous que tous les participants sont connectés\n` +
      `• Commentez les résultats en direct\n` +
      `• Faites une synthèse des réponses\n` +
      (section.description ? `\nDétails:\n${section.description}` : ""),
  };

  return typeInstructions[section.type] || typeInstructions.presentation;
}

function generateSummary(title: string, sections: SessionSection[]): string {
  const totalDuration = sections.reduce((acc, s) => acc + s.duration, 0);
  const types = sections.reduce(
    (acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  let summary = `Session "${title}" analysée avec succès.\n\n`;
  summary += `📊 ${sections.length} sections identifiées pour une durée totale de ${totalDuration} minutes.\n\n`;
  summary += `Répartition:\n`;

  const typeLabels: Record<string, string> = {
    presentation: "📋 Présentations",
    workshop: "🔧 Ateliers",
    break: "☕ Pauses",
    discussion: "💬 Discussions",
    interaction: "🎯 Interactions",
  };

  for (const [type, count] of Object.entries(types)) {
    summary += `• ${typeLabels[type] || type}: ${count}\n`;
  }

  return summary;
}

function generateSuggestions(sections: SessionSection[]): string[] {
  const suggestions: string[] = [];
  const totalDuration = sections.reduce((acc, s) => acc + s.duration, 0);

  // Check for breaks
  if (totalDuration > 90 && !sections.some((s) => s.type === "break")) {
    suggestions.push(
      "💡 La session dure plus de 90 minutes. Ajoutez une pause pour maintenir l'attention."
    );
  }

  // Check for interactions
  if (!sections.some((s) => s.type === "interaction")) {
    suggestions.push(
      "🎯 Ajoutez des moments d'interaction (sondage, nuage de mots) pour dynamiser la session."
    );
  }

  // Check for long sections
  const longSections = sections.filter((s) => s.duration > 45);
  if (longSections.length > 0) {
    suggestions.push(
      `⏱️ ${longSections.length} section(s) dépassent 45 minutes. Envisagez de les découper.`
    );
  }

  // Check variety
  const types = new Set(sections.map((s) => s.type));
  if (types.size < 3) {
    suggestions.push(
      "🎨 Variez les formats (présentation, atelier, discussion) pour un meilleur engagement."
    );
  }

  // Ice breaker suggestion
  if (
    sections.length > 0 &&
    sections[0].type !== "interaction"
  ) {
    suggestions.push(
      "🧊 Commencez par un ice-breaker interactif pour créer de la dynamique."
    );
  }

  return suggestions;
}
