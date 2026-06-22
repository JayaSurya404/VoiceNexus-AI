import type { TtsProviderResult } from "../../domain/entities/tts-provider-result.js";
import type { TtsProvider } from "../../providers/tts-provider.js";

export class TtsStreamService {
  constructor(private readonly provider: TtsProvider) {}

  synthesize(input: {
    organizationId: string;
    voiceResponseId: string;
    text: string;
    voice: string | null;
  }): Promise<TtsProviderResult> {
    return this.provider.synthesize({
      organizationId: input.organizationId,
      voiceResponseId: input.voiceResponseId,
      text: input.text,
      voice: input.voice,
    });
  }

  providerName(): string {
    return this.provider.name;
  }
}
