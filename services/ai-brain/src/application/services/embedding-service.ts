import type { EmbeddingProvider } from "../../providers/embedding-provider.js";

export class EmbeddingService {
  constructor(private readonly provider: EmbeddingProvider) {}

  embed(input: string): Promise<number[]> {
    return this.provider.embed(input);
  }

  embedMany(input: string[]): Promise<number[][]> {
    return this.provider.embedMany(input);
  }
}
