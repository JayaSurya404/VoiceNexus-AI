export type GovernanceFeatureFlagKey =
  | "ai_calling"
  | "whatsapp"
  | "crm"
  | "memory"
  | "automation"
  | "analytics"
  | "rag"
  | "optimization";

export interface FeatureFlag {
  id: string;
  organizationId: string;
  key: GovernanceFeatureFlagKey;
  enabled: boolean;
  rolloutPercentage: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
