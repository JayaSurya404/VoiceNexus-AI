import { env } from "../config/env.js";
import type { TtsProviderResult } from "../domain/entities/tts-provider-result.js";
import type { TtsRequest } from "../domain/entities/tts-request.js";
import type { TtsProvider } from "./tts-provider.js";

export class ElevenLabsProvider implements TtsProvider {
  readonly name = "elevenlabs";

  async synthesize(input: TtsRequest): Promise<TtsProviderResult> {
    const voice = input.voice ?? env.ELEVENLABS_VOICE_ID;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, {
      method: "POST",
      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: input.text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_22050_32",
      }),
    });

    if (!response.ok) throw new Error(`ElevenLabs TTS failed with status ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      provider: this.name,
      voice,
      mimeType: "audio/mpeg",
      audioUrl: null,
      audioBase64: bytes.toString("base64"),
      durationMs: Math.max(900, Math.ceil(input.text.split(/\s+/).length / 2.6) * 1000),
      audioBytes: bytes.byteLength,
      createdAt: new Date(),
    };
  }
}
