export type AuditActorType = "USER" | "SYSTEM" | "API_KEY" | "SERVICE";

export interface AuditLog {
  id: string;
  organizationId: string;
  actorId: string | null;
  actorType: AuditActorType;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
