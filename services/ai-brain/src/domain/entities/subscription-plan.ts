export type SubscriptionPlanTier = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface SubscriptionPlanLimits {
  seats: number;
  calls: number;
  minutes: number;
  messages: number;
  aiRequests: number;
  storageGb: number;
  workflowExecutions: number;
}

export interface SubscriptionPlan {
  id: string;
  organizationId: string | null;
  tier: SubscriptionPlanTier;
  name: string;
  description: string;
  monthlyPriceCents: number;
  limits: SubscriptionPlanLimits;
  features: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
