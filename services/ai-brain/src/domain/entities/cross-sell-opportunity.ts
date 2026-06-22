export interface CrossSellOpportunity {
  id: string;
  organizationId: string;
  customerId: string | null;
  opportunityId: string | null;
  product: string;
  affinityScore: number;
  estimatedValue: number;
  complementaryServices: string[];
  reasons: string[];
  status: "OPEN" | "ACCEPTED" | "DISMISSED";
  createdAt: Date;
  updatedAt: Date;
}
