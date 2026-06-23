import type { ChatCompletionInput, ChatCompletionOutput, ChatCompletionProvider } from "../../providers/chat-provider.js";

export interface ProviderStatus {
  provider: string;
  ready: boolean;
  defaultModel: string;
  message: string;
}

export class ProviderRegistryService {
  private readonly providers = new Map<string, ChatCompletionProvider>();

  constructor(providers: ChatCompletionProvider[]) {
    providers.forEach((provider) => this.providers.set(provider.name, provider));
  }

  async complete(providerName: string, input: ChatCompletionInput): Promise<ChatCompletionOutput> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Chat provider ${providerName} is not registered`);
    }
    return provider.complete(input);
  }

  async status(): Promise<ProviderStatus[]> {
    return Promise.all(
      [...this.providers.values()].map(async (provider) => {
        const health = await provider.health();
        return {
          provider: provider.name,
          ready: health.ready,
          defaultModel: provider.defaultModel,
          message: health.message,
        };
      }),
    );
  }
}
