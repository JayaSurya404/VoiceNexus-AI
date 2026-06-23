export type RateLimitScope = "USER" | "ORGANIZATION" | "API_KEY";

export interface RateLimitRule {
  id: string;
  organizationId: string | null;
  scope: RateLimitScope;
  subjectId: string | null;
  limit: number;
  windowSeconds: number;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitState {
  id: string;
  organizationId: string | null;
  scope: RateLimitScope;
  subjectId: string;
  count: number;
  resetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
