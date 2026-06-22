export type SentimentLabel = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export interface SentimentAnalysis {
  id: string;
  organizationId: string;
  conversationId: string;
  agentSessionId: string | null;
  sentiment: SentimentLabel;
  score: number;
  confidence: number;
  reasoning: string;
  createdAt: Date;
  updatedAt: Date;
}
