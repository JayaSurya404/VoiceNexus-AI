import type { UsageRecord, UsageRecordMetric } from "../../domain/entities/usage-record.js";
import type { AuditLogRepository, UsageRecordRepository } from "../ports.js";

export class UsageTrackingService {
  constructor(
    private readonly usageRecords: UsageRecordRepository,
    private readonly auditLogs: AuditLogRepository,
  ) {}

  async list(organizationId: string): Promise<UsageRecord[]> {
    return this.usageRecords.listByOrganization(organizationId);
  }

  async totals(organizationId: string): Promise<Record<UsageRecordMetric, number>> {
    return this.usageRecords.sumByMetric(organizationId);
  }

  async record(input: {
    organizationId: string;
    metric: UsageRecordMetric;
    quantity: number;
    unit: string;
    source?: string;
    occurredAt?: Date;
    metadata?: Record<string, unknown>;
  }): Promise<UsageRecord> {
    const usage = await this.usageRecords.create({
      organizationId: input.organizationId,
      metric: input.metric,
      quantity: input.quantity,
      unit: input.unit,
      source: input.source ?? "system",
      occurredAt: input.occurredAt ?? new Date(),
      metadata: input.metadata ?? {},
    });
    await this.auditLogs.create({
      organizationId: input.organizationId,
      actorId: null,
      actorType: "SYSTEM",
      action: "usage.recorded",
      resourceType: "usage_record",
      resourceId: usage.id,
      ipAddress: null,
      userAgent: null,
      metadata: { metric: usage.metric, quantity: usage.quantity },
    });
    return usage;
  }
}
