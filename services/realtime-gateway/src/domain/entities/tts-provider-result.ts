export interface TtsProviderResult {
  provider: string;
  voice: string;
  mimeType: string;
  audioUrl: string | null;
  audioBase64: string;
  durationMs: number;
  audioBytes: number;
  createdAt: Date;
}
