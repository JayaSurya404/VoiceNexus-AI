import type { CoachingInsightType } from "../../domain/entities/agent-coaching-insight.js";

export interface ObjectionCoachingSuggestion {
  type: CoachingInsightType;
  message: string;
  reasoning: string;
  confidence: number;
}

export class ObjectionCoachingService {
  generate(transcript: string): ObjectionCoachingSuggestion[] {
    const normalized = transcript.toLowerCase();
    const suggestions: ObjectionCoachingSuggestion[] = [];

    if (/(price|cost|expensive|budget)/.test(normalized)) {
      suggestions.push({
        type: "OBJECTION_HANDLING",
        message: "Acknowledge the budget concern, then anchor the discussion in measurable outcomes.",
        reasoning: "The customer raised price or budget language that benefits from value-based framing.",
        confidence: 0.82
      });
    }

    if (/(not interested|send information|maybe later)/.test(normalized)) {
      suggestions.push({
        type: "FOLLOW_UP",
        message: "Offer a concise follow-up with one relevant proof point and a specific next step.",
        reasoning: "The conversation shows a soft objection or deferral.",
        confidence: 0.74
      });
    }

    return suggestions;
  }
}
