export interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ProviderToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ProviderResponse {
  content: string;
  toolCalls: ProviderToolCall[];
  tokens: number;
}

export interface AIProvider {
  complete(input: {
    messages: ProviderMessage[];
    tools?: ProviderToolDefinition[];
    temperature?: number;
  }): Promise<ProviderResponse>;
  generateJson<T>(input: {
    messages: ProviderMessage[];
    schemaName: string;
    schema: Record<string, unknown>;
    temperature?: number;
  }): Promise<T>;
}
