export interface LeadQualification {
  id: string;
  organizationId: string;
  leadId: string;
  conversationId: string | null;
  agentSessionId: string | null;
  score: number;
  confidence: number;
  hotScore: number;
  warmScore: number;
  coldScore: number;
  budgetDetected: boolean;
  authorityDetected: boolean;
  needDetected: boolean;
  timelineDetected: boolean;
  urgencyDetected: boolean;
  decisionMakerDetected: boolean;
  objections: string[];
  interestLevel: "HOT" | "WARM" | "COLD" | "UNKNOWN";
  qualificationReason: string;
  updatedAt: Date;
}
