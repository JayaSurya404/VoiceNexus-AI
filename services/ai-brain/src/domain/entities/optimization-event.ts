export type OptimizationEventType =
  | "KPI_THRESHOLD_BREACHED"
  | "BOTTLENECK_DETECTED"
  | "RECOMMENDATION_GENERATED"
  | "ACTION_CREATED"
  | "RESULT_CAPTURED";

export interface OptimizationEvent {
  id: string;
  organizationId: string;
  type: OptimizationEventType;
  source: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  metadata: Record<string, unknown>;
  createdAt: Date;
}
