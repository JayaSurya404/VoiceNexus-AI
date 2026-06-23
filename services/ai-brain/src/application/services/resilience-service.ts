import type { CircuitBreaker, FallbackStrategy, RetryPolicy } from "../../domain/entities/resilience.js";
import type { CircuitBreakerRepository, FallbackStrategyRepository, RetryPolicyRepository } from "../ports.js";

const PROVIDERS: RetryPolicy["provider"][] = ["OPENAI", "GROQ", "GEMINI", "TWILIO", "REDIS"];

export class ResilienceService {
  constructor(
    private readonly retryPolicies: RetryPolicyRepository,
    private readonly circuitBreakers: CircuitBreakerRepository,
    private readonly fallbackStrategies: FallbackStrategyRepository,
  ) {}

  async ensureDefaults(organizationId: string | null = null): Promise<void> {
    await Promise.all(
      PROVIDERS.flatMap((provider) => [
        this.retryPolicies.upsert({
          organizationId,
          provider,
          maxAttempts: provider === "REDIS" ? 2 : 3,
          backoffMs: provider === "TWILIO" ? 1000 : 500,
          jitter: true,
          active: true,
        }),
        this.circuitBreakers.upsert({
          organizationId,
          provider,
          state: "CLOSED",
          failureThreshold: 5,
          failureCount: 0,
          resetAfterSeconds: 60,
          openedAt: null,
          lastFailureAt: null,
          metadata: {},
        }),
        this.fallbackStrategies.upsert({
          organizationId,
          provider,
          strategy: provider === "REDIS" ? "DEGRADE_GRACEFULLY" : "QUEUE_FOR_RETRY",
          enabled: true,
          metadata: {},
        }),
      ]),
    );
  }

  async retries(organizationId: string | null = null): Promise<RetryPolicy[]> {
    await this.ensureDefaults(organizationId);
    return this.retryPolicies.list(organizationId);
  }

  async breakers(organizationId: string | null = null): Promise<CircuitBreaker[]> {
    await this.ensureDefaults(organizationId);
    return this.circuitBreakers.list(organizationId);
  }

  async fallbacks(organizationId: string | null = null): Promise<FallbackStrategy[]> {
    await this.ensureDefaults(organizationId);
    return this.fallbackStrategies.list(organizationId);
  }
}
