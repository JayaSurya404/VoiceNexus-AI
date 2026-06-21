import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";

import type { AIProvider, ProviderMessage, ProviderResponse, ProviderToolCall, ProviderToolDefinition } from "./ai-provider.js";

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;

  constructor(
    private readonly config: {
      apiKey: string;
      model: string;
    },
  ) {
    this.client = new OpenAI({ apiKey: config.apiKey });
  }

  async complete(input: {
    messages: ProviderMessage[];
    tools?: ProviderToolDefinition[];
    temperature?: number;
  }): Promise<ProviderResponse> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: toOpenAiMessages(input.messages),
      temperature: input.temperature ?? 0.25,
      tools: input.tools?.map((tool): ChatCompletionTool => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      })),
      tool_choice: input.tools?.length ? "auto" : undefined,
    });
    const choice = response.choices.at(0)?.message;

    return {
      content: textContent(choice?.content),
      toolCalls:
        choice?.tool_calls
          ?.filter((toolCall) => toolCall.type === "function")
          .map((toolCall): ProviderToolCall => ({
            id: toolCall.id,
            name: toolCall.function.name,
            arguments: parseObject(toolCall.function.arguments),
          })) ?? [],
      tokens: response.usage?.total_tokens ?? estimateTokens(input.messages.map((message) => message.content).join("\n")),
    };
  }

  async generateJson<T>(input: {
    messages: ProviderMessage[];
    schemaName: string;
    schema: Record<string, unknown>;
    temperature?: number;
  }): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: toOpenAiMessages(input.messages),
      temperature: input.temperature ?? 0.1,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: input.schemaName,
          strict: true,
          schema: input.schema,
        },
      },
    });
    return JSON.parse(textContent(response.choices.at(0)?.message.content)) as T;
  }
}

function toOpenAiMessages(messages: ProviderMessage[]): ChatCompletionMessageParam[] {
  return messages.map((message): ChatCompletionMessageParam => ({ role: message.role, content: message.content }));
}

function textContent(content: string | Array<unknown> | null | undefined): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map((part) => (typeof part === "string" ? part : JSON.stringify(part))).join("");
  }

  return "";
}

function parseObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
