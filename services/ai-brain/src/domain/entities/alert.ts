export interface AlertRule {
  id: string;
  organizationId: string | null;
  name: string;
  trigger: "SERVICE_DOWN" | "DATABASE_UNAVAILABLE" | "REDIS_UNAVAILABLE" | "HIGH_LATENCY" | "EXCESSIVE_FAILURES";
  threshold: number;
  windowSeconds: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertEvent {
  id: string;
  organizationId: string | null;
  ruleId: string | null;
  trigger: AlertRule["trigger"];
  title: string;
  message: string;
  severity: AlertRule["severity"];
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
