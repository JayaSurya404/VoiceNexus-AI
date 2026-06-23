export type ApiKeyType = "SECRET" | "PUBLIC";

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  type: ApiKeyType;
  keyPrefix: string;
  keyHash: string;
  scopes: string[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdBy: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
