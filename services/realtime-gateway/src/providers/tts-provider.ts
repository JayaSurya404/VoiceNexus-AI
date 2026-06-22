import type { TtsProviderResult } from "../domain/entities/tts-provider-result.js";
import type { TtsRequest } from "../domain/entities/tts-request.js";

export interface TtsProvider {
  readonly name: string;
  synthesize(input: TtsRequest): Promise<TtsProviderResult>;
}
