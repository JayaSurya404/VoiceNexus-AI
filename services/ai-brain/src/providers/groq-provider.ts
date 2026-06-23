import type { ChatCompletionInput, ChatCompletionOutput, ChatCompletionProvider } from "./chat-provider.js";

export class GroqProvider implements ChatCompletionProvider {
  readonly name = "groq";

  constructor(
    private readonly options: {
      apiKey: string | null;
      defaultModel: string;
    },
  ) {}

  get defaultModel(): string {
    return this.options.defaultModel;
  }

  async complete(input: ChatCompletionInput): Promise<ChatCompletionOutput> {
    if (!this.options.apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: input.model ?? this.options.defaultModel,
        messages: input.messages,
        temperature: input.temperature ?? 0.2,
        max_tokens: input.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq chat completion failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    };

    return {
      provider: this.name,
      model: payload.model ?? input.model ?? this.options.defaultModel,
      content: payload.choices?.[0]?.message?.content ?? "",
      usage: {
        inputTokens: payload.usage?.prompt_tokens ?? 0,
        outputTokens: payload.usage?.completion_tokens ?? 0,
        totalTokens: payload.usage?.total_tokens ?? 0,
      },
    };
  }

  health(): Promise<{ provider: string; ready: boolean; message: string }> {
    return Promise.resolve({
      provider: this.name,
      ready: Boolean(this.options.apiKey),
      message: this.options.apiKey ? "Groq provider configured" : "GROQ_API_KEY is missing",
    });
  }
}
