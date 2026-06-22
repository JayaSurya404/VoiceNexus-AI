export type OpportunityStatus = "OPEN" | "WON" | "LOST";

export interface Opportunity {
  id: string;
  organizationId: string;
  leadId: string | null;
  crmContactId: string | null;
  crmDealId: string | null;
  name: string;
  value: number;
  probability: number;
  expectedCloseDate: Date | null;
  stageId: string | null;
  stageName: string;
  source: string;
  ownerId: string | null;
  aiScore: number;
  status: OpportunityStatus;
  createdAt: Date;
  updatedAt: Date;
}
