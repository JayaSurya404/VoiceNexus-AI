import type { ChatCompletionInput, ChatCompletionOutput } from "../../providers/chat-provider.js";
import type {
  OrganizationProviderRuntimeConfig,
  RuntimeFallbackEvent,
  RuntimeProviderName,
  RuntimeProviderSelection
} from "../../domain/entities/runtime-orchestration.js";
import type {
  MongoProviderRuntimeConfigRepository,
  MongoRuntimeFallbackEventRepository
} from "../../infrastructure/database/mongoose/repositories/runtime-orchestration-repositories.js";
import type { ProviderRegistryService, ProviderStatus } from "./provider-registry-service.js";
import type { RuntimeIncidentService } from "./runtime-incident-service.js";
import type { RuntimeRealtimeEventService } from "./runtime-realtime-event-service.js";

const runtimeProviders: RuntimeProviderName[] = ["openai", "groq", "gemini"];

const isRuntimeProvider = (value: string): value is RuntimeProviderName =>
  runtimeProviders.includes(value as RuntimeProviderName);

export interface RuntimeCompletionResult {
  output: ChatCompletionOutput;
  selection: RuntimeProviderSelection;
  fallbackUsed: boolean;
  fallbackEvent?: RuntimeFallbackEvent;
}

export class ProviderRuntimeSelectionService {
  public constructor(
    private readonly configs: MongoProviderRuntimeConfigRepository,
    private readonly fallbackEvents: MongoRuntimeFallbackEventRepository,
    private readonly providerRegistry: ProviderRegistryService,
    private readonly incidents: RuntimeIncidentService,
    private readonly realtime: RuntimeRealtimeEventService
  ) {}

  public async getConfig(organizationId: string): Promise<OrganizationProviderRuntimeConfig> {
    return (
      (await this.configs.getByOrganization(organizationId)) ?? {
        organizationId,
        preferredProvider: "openai",
        fallbackProviders: ["groq", "gemini"],
        modelByProvider: {},
        automaticFallback: true,
        active: true,
        updatedAt: new Date()
      }
    );
  }

  public async select(organizationId: string): Promise<RuntimeProviderSelection> {
    const config = await this.getConfig(organizationId);
    const statuses = await this.providerRegistry.status();
    const fallbackChain = this.uniqueProviders([config.preferredProvider, ...config.fallbackProviders]);
    const selectedProvider = fallbackChain.find((provider) => this.isReady(statuses, provider)) ?? config.preferredProvider;

    return {
      provider: selectedProvider,
      model: config.modelByProvider[selectedProvider] ?? this.defaultModel(statuses, selectedProvider),
      fallbackChain: fallbackChain.filter((provider) => provider !== selectedProvider),
      reason:
        selectedProvider === config.preferredProvider
          ? "Preferred provider is healthy"
          : "Preferred provider unavailable; selected healthy fallback",
      healthAware: true
    };
  }

  public async completeWithFallback(
    organizationId: string,
    sessionId: string | undefined,
    input: ChatCompletionInput
  ): Promise<RuntimeCompletionResult> {
    const config = await this.getConfig(organizationId);
    const statuses = await this.providerRegistry.status();
    const providerChain = this.uniqueProviders([config.preferredProvider, ...config.fallbackProviders]);
    const healthyChain = providerChain.filter((provider) => this.isReady(statuses, provider));
    const executionChain = config.automaticFallback ? healthyChain : healthyChain.slice(0, 1);
    const providersToTry = executionChain.length > 0 ? executionChain : [config.preferredProvider];
    const primaryProvider = providersToTry[0] ?? config.preferredProvider;
    let lastError: Error | null = null;

    for (let index = 0; index < providersToTry.length; index += 1) {
      const provider = providersToTry[index];
      if (!provider) {
        continue;
      }
      try {
        const model = config.modelByProvider[provider] ?? this.defaultModel(statuses, provider);
        const output = await this.providerRegistry.complete(provider, { ...input, model });
        const fallbackUsed = index > 0;
        const selection: RuntimeProviderSelection = {
          provider,
          model,
          fallbackChain: providersToTry.filter((candidate) => candidate !== provider),
          reason: fallbackUsed ? "Fallback provider completed the request" : "Primary provider completed the request",
          healthAware: true
        };

        if (fallbackUsed) {
          const fallbackEvent = await this.fallbackEvents.create({
            organizationId,
            ...(sessionId ? { sessionId } : {}),
            fromProvider: primaryProvider,
            toProvider: provider,
            reason: lastError?.message ?? "Provider fallback selected",
            recovered: true
          });
          await this.realtime.publish(organizationId, "runtime.provider.fallback", { fallbackEvent });
          return { output, selection, fallbackUsed, fallbackEvent };
        }

        return { output, selection, fallbackUsed };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Provider completion failed");
      }
    }

    await this.incidents.create({
      organizationId,
      ...(sessionId ? { sessionId } : {}),
      severity: "HIGH",
      category: "PROVIDER",
      message: lastError?.message ?? "All providers failed"
    });
    throw lastError ?? new Error("All providers failed");
  }

  public listFallbackEvents(organizationId: string): Promise<RuntimeFallbackEvent[]> {
    return this.fallbackEvents.listByOrganization(organizationId);
  }

  private uniqueProviders(providers: RuntimeProviderName[]): RuntimeProviderName[] {
    return providers.filter((provider, index) => providers.indexOf(provider) === index);
  }

  private isReady(statuses: ProviderStatus[], provider: RuntimeProviderName): boolean {
    return statuses.some((status) => status.provider === provider && status.ready);
  }

  private defaultModel(statuses: ProviderStatus[], provider: RuntimeProviderName): string {
    const status = statuses.find((candidate) => candidate.provider === provider);
    return status?.defaultModel ?? "default";
  }
}

export const toRuntimeProviderName = (provider: string): RuntimeProviderName => {
  if (isRuntimeProvider(provider)) {
    return provider;
  }

  return "openai";
};
