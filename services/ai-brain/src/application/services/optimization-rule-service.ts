import type { OptimizationRule } from "../../domain/entities/optimization-rule.js";
import type { OptimizationRuleRepository } from "../ports.js";

export class OptimizationRuleService {
  constructor(private readonly rules: OptimizationRuleRepository) {}

  async list(organizationId: string): Promise<OptimizationRule[]> {
    const existing = await this.rules.listByOrganization(organizationId);
    if (existing.length) return existing;

    await Promise.all([
      this.rules.create({ organizationId, name: "Queue wait breach", scope: "QUEUE", condition: { metric: "Average Wait Time", operator: ">", value: 120 }, action: "Rebalance active queues", priority: 90, active: true }),
      this.rules.create({ organizationId, name: "Revenue risk breach", scope: "REVENUE", condition: { metric: "Risk Value", operator: ">", value: 10000 }, action: "Create deal recovery plan", priority: 80, active: true }),
    ]);
    return this.rules.listByOrganization(organizationId);
  }
}
