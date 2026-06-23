import type { ChatCompletionInput, ChatCompletionOutput, ChatCompletionProvider } from "./chat-provider.js";

export class GeminiProvider implements ChatCompletionProvider {
  readonly name = "gemini";

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
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const model = input.model ?? this.options.defaultModel;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(this.options.apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: input.messages
            .filter((message) => message.role !== "system")
            .map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })),
          systemInstruction: {
            parts: input.messages.filter((message) => message.role === "system").map((message) => ({ text: message.content })),
          },
          generationConfig: {
            temperature: input.temperature ?? 0.2,
            maxOutputTokens: input.maxTokens,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini chat completion failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
    };

    return {
      provider: this.name,
      model,
      content: payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "",
      usage: {
        inputTokens: payload.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: payload.usageMetadata?.candidatesTokenCount ?? 0,
        totalTokens: payload.usageMetadata?.totalTokenCount ?? 0,
      },
    };
  }

  health(): Promise<{ provider: string; ready: boolean; message: string }> {
    return Promise.resolve({
      provider: this.name,
      ready: Boolean(this.options.apiKey),
      message: this.options.apiKey ? "Gemini provider configured" : "GEMINI_API_KEY is missing",
    });
  }
}
