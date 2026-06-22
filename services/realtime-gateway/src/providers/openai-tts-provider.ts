import { env } from "../config/env.js";
import type { TtsProviderResult } from "../domain/entities/tts-provider-result.js";
import type { TtsRequest } from "../domain/entities/tts-request.js";
import type { TtsProvider } from "./tts-provider.js";

export class OpenAiTtsProvider implements TtsProvider {
  readonly name = "openai";

  async synthesize(input: TtsRequest): Promise<TtsProviderResult> {
    const voice = input.voice ?? "alloy";
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: env.OPENAI_TTS_MODEL,
        voice,
        input: input.text,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS failed with status ${response.status}`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    return {
      provider: this.name,
      voice,
      mimeType: "audio/mpeg",
      audioUrl: null,
      audioBase64: bytes.toString("base64"),
      durationMs: estimateDurationMs(input.text),
      audioBytes: bytes.byteLength,
      createdAt: new Date(),
    };
  }
}

function estimateDurationMs(text: string): number {
  return Math.max(900, Math.ceil(text.split(/\s+/).length / 2.6) * 1000);
}
