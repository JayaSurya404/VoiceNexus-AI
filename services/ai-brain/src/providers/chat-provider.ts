export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionInput {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatCompletionOutput {
  provider: string;
  model: string;
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface ChatCompletionProvider {
  readonly name: string;
  readonly defaultModel: string;
  complete(input: ChatCompletionInput): Promise<ChatCompletionOutput>;
  health(): Promise<{ provider: string; ready: boolean; message: string }>;
}
