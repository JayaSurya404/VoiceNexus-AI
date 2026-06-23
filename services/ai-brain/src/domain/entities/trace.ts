export type TraceStatus = "OK" | "ERROR" | "TIMEOUT";

export interface Trace {
  id: string;
  organizationId: string | null;
  traceId: string;
  rootSpanId: string | null;
  name: string;
  status: TraceStatus;
  startedAt: Date;
  endedAt: Date | null;
  durationMs: number | null;
  attributes: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Span {
  id: string;
  organizationId: string | null;
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  name: string;
  status: TraceStatus;
  startedAt: Date;
  endedAt: Date | null;
  durationMs: number | null;
  attributes: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLog {
  id: string;
  organizationId: string | null;
  traceId: string | null;
  source: "API" | "AI" | "TWILIO" | "WORKFLOW" | "AUTOMATION" | "SYSTEM";
  eventName: string;
  severity: "DEBUG" | "INFO" | "WARN" | "ERROR";
  message: string;
  metadata: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
