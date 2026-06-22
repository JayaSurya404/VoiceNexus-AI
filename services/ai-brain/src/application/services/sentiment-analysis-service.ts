import type { SentimentAnalysisRepository } from "../ports.js";
import type { AIConversation } from "../../domain/entities/ai-conversation.js";
import type { SentimentAnalysis, SentimentLabel } from "../../domain/entities/sentiment-analysis.js";

export class SentimentAnalysisService {
  constructor(private readonly sentimentAnalyses: SentimentAnalysisRepository) {}

  async analyzeConversation(
    conversation: AIConversation,
    agentSessionId: string | null,
  ): Promise<SentimentAnalysis> {
    const sentiment = normalizeSentiment(conversation.sentiment);
    const concernPenalty = Math.min(conversation.customerConcerns.length * 0.15, 0.45);
    const opportunityBoost = Math.min(conversation.opportunities.length * 0.1, 0.3);
    const baseScore = sentiment === "POSITIVE" ? 0.65 : sentiment === "NEGATIVE" ? -0.65 : 0;
    const score = clamp(baseScore + opportunityBoost - concernPenalty, -1, 1);
    const confidence = clamp(0.55 + Math.abs(score) * 0.35 + conversation.leadScore / 500, 0, 0.98);
    const reasoning = `${sentiment.toLowerCase()} sentiment from conversation state, ${conversation.customerConcerns.length} concerns, and ${conversation.opportunities.length} opportunities.`;

    return this.sentimentAnalyses.upsert({
      organizationId: conversation.organizationId,
      conversationId: conversation.id,
      agentSessionId,
      sentiment,
      score,
      confidence,
      reasoning,
    });
  }
}

function normalizeSentiment(sentiment: AIConversation["sentiment"]): SentimentLabel {
  if (sentiment === "POSITIVE" || sentiment === "NEGATIVE") return sentiment;
  return "NEUTRAL";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
