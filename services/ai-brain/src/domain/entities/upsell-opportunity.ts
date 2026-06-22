export interface UpsellOpportunity {
  id: string;
  organizationId: string;
  customerId: string | null;
  opportunityId: string | null;
  product: string;
  estimatedValue: number;
  fitScore: number;
  reasons: string[];
  recommendedActions: string[];
  status: "OPEN" | "ACCEPTED" | "DISMISSED";
  createdAt: Date;
  updatedAt: Date;
}
