import type { RateLimitScope, RateLimitState } from "../../domain/entities/rate-limit.js";
import type { RateLimitRuleRepository, RateLimitStateRepository } from "../ports.js";

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export class RateLimitService {
  constructor(
    private readonly rules: RateLimitRuleRepository,
    private readonly states: RateLimitStateRepository,
  ) {}

  async check(input: {
    organizationId?: string | null;
    scope: RateLimitScope;
    subjectId: string;
  }): Promise<RateLimitDecision> {
    const rules = await this.rules.list(input.organizationId ?? null);
    const rule = rules.find(
      (candidate) =>
        candidate.active &&
        candidate.scope === input.scope &&
        (!candidate.subjectId || candidate.subjectId === input.subjectId),
    );
    const limit = rule?.limit ?? 120;
    const resetAt = new Date(Date.now() + (rule?.windowSeconds ?? 60) * 1000);
    const state: RateLimitState = await this.states.increment({
      organizationId: input.organizationId ?? null,
      scope: input.scope,
      subjectId: input.subjectId,
      resetAt,
    });

    return {
      allowed: state.count <= limit,
      limit,
      remaining: Math.max(0, limit - state.count),
      resetAt: state.resetAt,
    };
  }
}
