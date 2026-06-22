import OpenAI from "openai";

import type { EmbeddingProvider } from "./embedding-provider.js";

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private readonly client: OpenAI;

  constructor(
    input: {
      apiKey: string;
      model?: string;
    },
  ) {
    this.client = new OpenAI({ apiKey: input.apiKey });
    this.model = input.model ?? "text-embedding-3-small";
  }

  private readonly model: string;

  async embed(input: string): Promise<number[]> {
    const [embedding] = await this.embedMany([input]);
    return embedding ?? [];
  }

  async embedMany(input: string[]): Promise<number[][]> {
    if (!input.length) return [];
    const response = await this.client.embeddings.create({
      model: this.model,
      input,
    });
    return response.data
      .sort((left, right) => left.index - right.index)
      .map((item) => item.embedding);
  }
}
