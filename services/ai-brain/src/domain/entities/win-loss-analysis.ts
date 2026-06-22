export type WinLossOutcome = "WIN" | "LOSS";

export interface WinLossAnalysis {
  id: string;
  organizationId: string;
  opportunityId: string;
  outcome: WinLossOutcome;
  reason: string;
  competitors: string[];
  successFactors: string[];
  failureFactors: string[];
  improvementSuggestions: string[];
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
