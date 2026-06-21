export const conversationStateNames = [
  "GREETING",
  "DISCOVERY",
  "QUALIFICATION",
  "OBJECTION",
  "PRICING",
  "FOLLOWUP",
  "TRANSFER",
  "COMPLETED",
] as const;

export type ConversationStateName = (typeof conversationStateNames)[number];

export interface ConversationState {
  id: string;
  organizationId: string;
  agentSessionId: string;
  leadId: string | null;
  callId: string | null;
  state: ConversationStateName;
  previousState: ConversationStateName | null;
  detectedIntent: string;
  detectedLanguage: string | null;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED" | "UNKNOWN";
  confidence: number;
  collectedFacts: Record<string, string>;
  transitionReason: string;
  updatedAt: Date;
}
