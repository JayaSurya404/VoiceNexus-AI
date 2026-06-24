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
        response_format: "pcm",
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS failed with status ${response.status}`);
    }

    const pcm24khz = Buffer.from(await response.arrayBuffer());
    const mulaw8khz = pcm16le24khzToMulaw8khz(pcm24khz);
    return {
      provider: this.name,
      voice,
      mimeType: "audio/x-mulaw;rate=8000",
      audioUrl: null,
      audioBase64: mulaw8khz.toString("base64"),
      durationMs: estimateDurationMs(input.text),
      audioBytes: mulaw8khz.byteLength,
      createdAt: new Date(),
    };
  }
}

function estimateDurationMs(text: string): number {
  return Math.max(900, Math.ceil(text.split(/\s+/).length / 2.6) * 1000);
}

function pcm16le24khzToMulaw8khz(input: Buffer): Buffer {
  const outputLength = Math.floor(input.length / 6);
  const output = Buffer.alloc(outputLength);
  let outputIndex = 0;

  for (let inputIndex = 0; inputIndex + 5 < input.length; inputIndex += 6) {
    const first = input.readInt16LE(inputIndex);
    const second = input.readInt16LE(inputIndex + 2);
    const third = input.readInt16LE(inputIndex + 4);
    output[outputIndex] = linear16ToMulaw(Math.round((first + second + third) / 3));
    outputIndex += 1;
  }

  return output;
}

function linear16ToMulaw(sample: number): number {
  const bias = 0x84;
  const clipped = Math.max(-32635, Math.min(32635, sample));
  const sign = clipped < 0 ? 0x80 : 0;
  const magnitude = Math.abs(clipped) + bias;
  let exponent = 7;

  for (let mask = 0x4000; exponent > 0 && (magnitude & mask) === 0; mask >>= 1) {
    exponent -= 1;
  }

  const mantissa = (magnitude >> (exponent + 3)) & 0x0f;
  return ~(sign | (exponent << 4) | mantissa) & 0xff;
}
