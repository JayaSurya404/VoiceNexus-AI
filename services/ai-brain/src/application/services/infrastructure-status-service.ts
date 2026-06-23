import type { InfrastructureConfig } from "../../config/infrastructure-config.js";
import type { RedisConnectionManager } from "../../infrastructure/redis/redis-connection-manager.js";
import type { ProviderRegistryService, ProviderStatus } from "./provider-registry-service.js";
import type { TwilioIntegrationService } from "./twilio-integration-service.js";

export interface InfrastructureStatus {
  providers: ProviderStatus[];
  redis: { ready: boolean; configured: boolean; message: string };
  mongo: { ready: boolean; configured: boolean; message: string };
  twilio: { ready: boolean; configured: boolean; message: string };
  environment: {
    name: string;
    production: boolean;
    ready: boolean;
    issues: InfrastructureConfig["issues"];
  };
}

export interface EnvironmentReadiness {
  ready: boolean;
  score: number;
  environment: string;
  production: boolean;
  issues: InfrastructureConfig["issues"];
}

export class InfrastructureStatusService {
  constructor(
    private readonly config: InfrastructureConfig,
    private readonly providers: ProviderRegistryService,
    private readonly redis: RedisConnectionManager,
    private readonly twilio: TwilioIntegrationService,
  ) {}

  async status(): Promise<InfrastructureStatus> {
    const missingRequiredCount = this.config.issues.filter((issue) => issue.required && !issue.valid).length;
    const redisHealth = await this.redis.health();
    const twilioHealth = this.twilio.health();
    return {
      providers: await this.providers.status(),
      redis: {
        ready: redisHealth.ready,
        configured: this.redis.configured,
        message: redisHealth.message,
      },
      mongo: {
        ready: Boolean(this.config.mongo.uri),
        configured: Boolean(this.config.mongo.uri),
        message: this.config.mongo.uri ? "MongoDB URI configured" : "MONGODB_URI is missing",
      },
      twilio: {
        ready: twilioHealth.ready,
        configured: Boolean(
          this.config.twilio.accountSid &&
            this.config.twilio.authToken &&
            this.config.twilio.fromNumber &&
            this.config.twilio.voiceWebhookUrl,
        ),
        message: twilioHealth.message,
      },
      environment: {
        name: this.config.runtimeEnvironment,
        production: this.config.runtimeEnvironment === "production",
        ready: missingRequiredCount === 0,
        issues: this.config.issues.filter((issue) => !issue.valid),
      },
    };
  }

  environmentReadiness(): EnvironmentReadiness {
    const invalidIssues = this.config.issues.filter((issue) => !issue.valid);
    const readyCount = this.config.issues.length - invalidIssues.length;
    const score = this.config.issues.length > 0 ? Math.round((readyCount / this.config.issues.length) * 100) : 100;
    return {
      ready: this.config.issues.every((issue) => !issue.required || issue.valid),
      score,
      environment: this.config.runtimeEnvironment,
      production: this.config.runtimeEnvironment === "production",
      issues: invalidIssues,
    };
  }
}
