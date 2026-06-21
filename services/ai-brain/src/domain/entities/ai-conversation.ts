export interface AIConversation {
  id: string;
  organizationId: string;
  leadId: string | null;
  callId: string | null;
  status: "ACTIVE" | "ENDED" | "FAILED";
  currentIntent: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED" | "UNKNOWN";
  leadScore: number;
  summary: string | null;
  outcome: string | null;
  nextActions: string[];
  actionItems: string[];
  customerConcerns: string[];
  opportunities: string[];
  state: {
    detectedLanguage: string | null;
    qualificationProgress: {
      budget: boolean;
      urgency: boolean;
      authority: boolean;
    };
    collectedFacts: Record<string, string>;
    lastResponse: string | null;
  };
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
