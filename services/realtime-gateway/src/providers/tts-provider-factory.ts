import { env } from "../config/env.js";
import { CartesiaProvider } from "./cartesia-provider.js";
import { ElevenLabsProvider } from "./elevenlabs-provider.js";
import { OpenAiTtsProvider } from "./openai-tts-provider.js";
import type { TtsProvider } from "./tts-provider.js";

export function createTtsProvider(): TtsProvider {
  switch (env.TTS_PROVIDER) {
    case "elevenlabs":
      return new ElevenLabsProvider();
    case "cartesia":
      return new CartesiaProvider();
    case "openai":
      return new OpenAiTtsProvider();
  }
}
