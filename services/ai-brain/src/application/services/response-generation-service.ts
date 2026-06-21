import type { ProviderMessage, ProviderToolCall, ProviderToolDefinition } from "../../providers/ai-provider.js";
import type { AIProvider } from "../../providers/ai-provider.js";

export interface GeneratedResponse {
  content: string;
  toolCalls: ProviderToolCall[];
  tokens: number;
  confidence: number;
}

export class ResponseGenerationService {
  constructor(private readonly provider: AIProvider) {}

  async generate(input: {
    messages: ProviderMessage[];
    tools: ProviderToolDefinition[];
  }): Promise<GeneratedResponse> {
    const response = await this.provider.complete({
      messages: input.messages,
      tools: input.tools,
      temperature: 0.25,
    });

    return {
      content: response.content || "I understand. Let me make a note of that and continue helping with the next best step.",
      toolCalls: response.toolCalls,
      tokens: response.tokens,
      confidence: response.content ? 0.78 : 0.55,
    };
  }
}
