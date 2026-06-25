import { env } from "../config/env.js";
import type { TtsProviderResult } from "../domain/entities/tts-provider-result.js";
import type { TtsRequest } from "../domain/entities/tts-request.js";
import type { TtsProvider } from "./tts-provider.js";

export class CartesiaProvider implements TtsProvider {
  readonly name = "cartesia";

  async synthesize(input: TtsRequest): Promise<TtsProviderResult> {
    const voice = input.voice ?? env.CARTESIA_VOICE_ID;
    const response = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "x-api-key": env.CARTESIA_API_KEY,
        "cartesia-version": "2024-06-10",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model_id: "sonic-2",
        transcript: input.text,
        voice: { mode: "id", id: voice },
        output_format: { container: "raw", encoding: "pcm_mulaw", sample_rate: 8000 },
      }),
    });

    if (!response.ok) throw new Error(`Cartesia TTS failed with status ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      provider: this.name,
      voice,
      mimeType: "audio/x-mulaw;rate=8000",
      audioUrl: null,
      audioBase64: bytes.toString("base64"),
      durationMs: Math.max(900, Math.ceil(input.text.split(/\s+/).length / 2.8) * 1000),
      audioBytes: bytes.byteLength,
      createdAt: new Date(),
    };
  }
}
