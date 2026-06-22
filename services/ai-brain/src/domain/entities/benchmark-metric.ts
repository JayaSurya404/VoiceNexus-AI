export interface BenchmarkMetric {
  id: string;
  organizationId: string;
  scope: "TEAM" | "QUEUE" | "AGENT" | "ORGANIZATION";
  metric: string;
  value: number;
  benchmarkValue: number;
  percentile: number;
  comparison: "ABOVE" | "BELOW" | "AT";
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
