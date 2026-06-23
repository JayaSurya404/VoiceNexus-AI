import type { Metric, MetricSnapshot } from "../../domain/entities/metric.js";
import type { MetricRepository, MetricSnapshotRepository } from "../ports.js";

export class MetricsService {
  constructor(
    private readonly metrics: MetricRepository,
    private readonly snapshots: MetricSnapshotRepository,
  ) {}

  async record(input: Omit<Metric, "id" | "createdAt" | "updatedAt">): Promise<Metric> {
    return this.metrics.create(input);
  }

  async collectSystem(organizationId: string | null = null): Promise<MetricSnapshot> {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    return this.snapshots.create({
      organizationId,
      category: "SYSTEM",
      metrics: {
        memoryRssBytes: memory.rss,
        memoryHeapUsedBytes: memory.heapUsed,
        memoryHeapTotalBytes: memory.heapTotal,
        cpuUserMicros: cpu.user,
        cpuSystemMicros: cpu.system,
        uptimeSeconds: Math.round(process.uptime()),
      },
      capturedAt: new Date(),
    });
  }

  async collectApplication(organizationId: string | null = null): Promise<MetricSnapshot> {
    return this.snapshots.create({
      organizationId,
      category: "APPLICATION",
      metrics: {
        requests: 0,
        errors: 0,
        latencyMs: 0,
        activeCalls: 0,
        activeSessions: 0,
        queueDepth: 0,
        websocketConnections: 0,
      },
      capturedAt: new Date(),
    });
  }

  async list(organizationId: string | null = null): Promise<Metric[]> {
    return this.metrics.list(organizationId);
  }

  async latest(category?: MetricSnapshot["category"], organizationId: string | null = null): Promise<MetricSnapshot[]> {
    return this.snapshots.latest(category, organizationId);
  }
}
