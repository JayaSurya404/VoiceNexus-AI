export type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ErrorEvent {
  id: string;
  organizationId: string | null;
  service: string;
  fingerprint: string;
  message: string;
  stack: string | null;
  severity: ErrorSeverity;
  metadata: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorFingerprint {
  id: string;
  organizationId: string | null;
  fingerprint: string;
  message: string;
  service: string;
  frequency: number;
  severity: ErrorSeverity;
  firstSeenAt: Date;
  lastSeenAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorIncident {
  id: string;
  organizationId: string | null;
  fingerprint: string;
  title: string;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  severity: ErrorSeverity;
  eventCount: number;
  firstOccurrenceAt: Date;
  lastOccurrenceAt: Date;
  assigneeId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
