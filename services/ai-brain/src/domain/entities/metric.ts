export type MetricKind = "COUNTER" | "GAUGE" | "HISTOGRAM";

export interface Metric {
  id: string;
  organizationId: string | null;
  name: string;
  kind: MetricKind;
  value: number;
  unit: string;
  tags: Record<string, string>;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MetricSnapshot {
  id: string;
  organizationId: string | null;
  category: "SYSTEM" | "APPLICATION" | "SERVICE";
  metrics: Record<string, number>;
  capturedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemMetric extends MetricSnapshot {
  category: "SYSTEM";
}

export interface ApplicationMetric extends MetricSnapshot {
  category: "APPLICATION";
}

export interface ServiceMetric extends MetricSnapshot {
  category: "SERVICE";
}
