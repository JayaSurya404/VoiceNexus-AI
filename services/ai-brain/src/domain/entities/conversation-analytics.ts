import type { CallOutcomeType } from "./call-outcome.js";
import type { SentimentLabel } from "./sentiment-analysis.js";

export interface ConversationAnalytics {
  id: string;
  organizationId: string;
  conversationId: string;
  agentSessionId: string | null;
  leadId: string | null;
  callId: string | null;
  aiConfidence: number;
  sentiment: SentimentLabel;
  sentimentScore: number;
  qualityScore: number;
  outcome: CallOutcomeType | null;
  leadScore: number;
  qualificationLevel: "HOT" | "WARM" | "COLD" | "UNKNOWN";
  workflowSuccessRate: number;
  createdAt: Date;
  updatedAt: Date;
}
