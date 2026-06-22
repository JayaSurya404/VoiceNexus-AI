export interface EmbeddingProvider {
  embed(input: string): Promise<number[]>;
  embedMany(input: string[]): Promise<number[][]>;
}
