import type { AlertEvent, AlertRule } from "../../domain/entities/alert.js";
import type { AlertEventRepository, AlertRuleRepository } from "../ports.js";

export class AlertingService {
  constructor(
    private readonly alertRules: AlertRuleRepository,
    private readonly alertEvents: AlertEventRepository,
  ) {}

  async rules(organizationId: string | null = null): Promise<AlertRule[]> {
    const existing = await this.alertRules.list(organizationId);
    if (existing.length) {
      return existing;
    }
    await Promise.all([
      this.alertRules.create({
        organizationId,
        name: "Database unavailable",
        trigger: "DATABASE_UNAVAILABLE",
        threshold: 1,
        windowSeconds: 60,
        severity: "CRITICAL",
        active: true,
        metadata: {},
      }),
      this.alertRules.create({
        organizationId,
        name: "High API latency",
        trigger: "HIGH_LATENCY",
        threshold: 2000,
        windowSeconds: 300,
        severity: "HIGH",
        active: true,
        metadata: {},
      }),
    ]);
    return this.alertRules.list(organizationId);
  }

  async events(organizationId: string | null = null): Promise<AlertEvent[]> {
    return this.alertEvents.list(organizationId);
  }
}
