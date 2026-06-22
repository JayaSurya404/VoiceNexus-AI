import type { BenchmarkMetric } from "../../domain/entities/benchmark-metric.js";
import type { BenchmarkMetricRepository } from "../ports.js";
import { RevenueAnalyticsService } from "./revenue-analytics-service.js";

export class BenchmarkService {
  constructor(
    private readonly benchmarks: BenchmarkMetricRepository,
    private readonly revenue: RevenueAnalyticsService,
  ) {}

  async calculate(organizationId: string): Promise<BenchmarkMetric[]> {
    const revenue = await this.revenue.summarize(organizationId);
    const benchmarkValue = Math.max(1, revenue.averageDealSize * 1.1);
    await this.benchmarks.create({
      organizationId,
      scope: "ORGANIZATION",
      metric: "Average Deal Size",
      value: revenue.averageDealSize,
      benchmarkValue,
      percentile: revenue.averageDealSize >= benchmarkValue ? 75 : 45,
      comparison: revenue.averageDealSize > benchmarkValue ? "ABOVE" : revenue.averageDealSize < benchmarkValue ? "BELOW" : "AT",
      computedAt: new Date(),
    });
    return this.benchmarks.listByOrganization(organizationId);
  }
}
