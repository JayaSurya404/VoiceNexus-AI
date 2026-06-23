import type { ChatCompletionInput, ChatCompletionOutput, ChatCompletionProvider } from "./chat-provider.js";

export interface OpenAIChatProviderOptions {
  apiKey?: string | null;
  defaultModel?: string;
  baseUrl?: string;
}

interface OpenAIChatCompletionChoice {
  message?: {
    content?: string;
  };
  finish_reason?: string;
}

interface OpenAIChatCompletionResponse {
  id?: string;
  choices?: OpenAIChatCompletionChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class OpenAIChatProvider implements ChatCompletionProvider {
  public readonly name = "openai";
  public readonly defaultModel: string;
  private readonly apiKey?: string;
  private readonly baseUrl: string;

  public constructor(options: OpenAIChatProviderOptions) {
    this.apiKey = options.apiKey ?? undefined;
    this.defaultModel = options.defaultModel ?? "gpt-4o-mini";
    this.baseUrl = options.baseUrl ?? "https://api.openai.com/v1";
  }

  public async complete(input: ChatCompletionInput): Promise<ChatCompletionOutput> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: input.model ?? this.defaultModel,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI chat completion failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenAIChatCompletionResponse;
    const choice = payload.choices?.[0];

    return {
      provider: this.name,
      model: input.model ?? this.defaultModel,
      content: choice?.message?.content ?? "",
      usage: {
        inputTokens: payload.usage?.prompt_tokens ?? 0,
        outputTokens: payload.usage?.completion_tokens ?? 0,
        totalTokens: payload.usage?.total_tokens ?? 0
      }
    };
  }

  public health(): Promise<{ provider: string; ready: boolean; message: string }> {
    if (!this.apiKey) {
      return Promise.resolve({
        provider: this.name,
        ready: false,
        message: "OpenAI API key is not configured"
      });
    }

    return Promise.resolve({
      provider: this.name,
      ready: true,
      message: "OpenAI provider configured"
    });
  }
}
