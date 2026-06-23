import type { SubscriptionPlanTier } from "./subscription-plan.js";

export type SubscriptionStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "SUSPENDED";

export interface SubscriptionUsageEntitlements {
  seats: number;
  calls: number;
  minutes: number;
  messages: number;
  aiRequests: number;
  storageGb: number;
  workflowExecutions: number;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  tier: SubscriptionPlanTier;
  status: SubscriptionStatus;
  seats: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  entitlements: SubscriptionUsageEntitlements;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
