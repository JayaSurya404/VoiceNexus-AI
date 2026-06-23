export interface DistributedLock {
  id: string;
  organizationId: string | null;
  lockKey: string;
  ownerId: string;
  purpose: "JOB" | "WORKFLOW" | "AUTOMATION" | "SYSTEM";
  expiresAt: Date;
  acquiredAt: Date;
  releasedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
