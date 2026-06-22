export type CallOutcomeType =
  | "SALE"
  | "BOOKED_MEETING"
  | "FOLLOW_UP"
  | "TRANSFERRED"
  | "VOICEMAIL"
  | "NO_INTEREST"
  | "FAILED";

export interface CallOutcome {
  id: string;
  organizationId: string;
  conversationId: string | null;
  agentSessionId: string | null;
  leadId: string | null;
  callId: string | null;
  outcome: CallOutcomeType;
  confidence: number;
  reasoning: string;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
