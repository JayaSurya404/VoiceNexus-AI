import type { ProviderMessage, ProviderToolCall, ProviderToolDefinition } from "../../providers/ai-provider.js";
import type { ProviderRuntimeSelectionService } from "./provider-runtime-selection-service.js";

export interface GeneratedResponse {
  content: string;
  toolCalls: ProviderToolCall[];
  tokens: number;
  confidence: number;
}

export class ResponseGenerationService {
  constructor(private readonly providerSelection: ProviderRuntimeSelectionService) {}

  async generate(input: {
    organizationId: string;
    sessionId?: string | null;
    messages: ProviderMessage[];
    tools: ProviderToolDefinition[];
  }): Promise<GeneratedResponse> {
    const result = await this.providerSelection.completeWithFallback(
      input.organizationId,
      input.sessionId ?? undefined,
      {
        messages: input.messages
          .filter((message) => message.role === "system" || message.role === "user" || message.role === "assistant")
          .map((message) => ({
            role: message.role,
            content: message.content,
          })),
        temperature: 0.25,
      },
    );

    return {
      content:
        result.output.content ||
        "I understand. Let me make a note of that and continue helping with the next best step.",
      toolCalls: [],
      tokens: result.output.usage.totalTokens,
      confidence: result.output.content ? 0.78 : 0.55,
    };
  }
}
