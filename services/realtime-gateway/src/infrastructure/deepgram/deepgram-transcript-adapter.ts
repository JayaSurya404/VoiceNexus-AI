import type { V1Socket } from "@deepgram/sdk/listen/v1";

type ListenV1Results = Extract<V1Socket.Response, { type: "Results" }>;

export interface NormalizedDeepgramTranscript {
  text: string;
  isFinal: boolean;
  speechFinal: boolean;
  confidence: number | null;
  language: string | null;
  metadata: Record<string, unknown>;
}

export class DeepgramTranscriptAdapter {
  fromMessage(message: unknown): NormalizedDeepgramTranscript | null {
    if (!isResultsMessage(message)) {
      return null;
    }

    const alternative = message.channel.alternatives.at(0);
    const text = alternative?.transcript?.trim() ?? "";

    if (!text) {
      return null;
    }

    return {
      text,
      isFinal: message.is_final ?? false,
      speechFinal: message.speech_final ?? false,
      confidence: typeof alternative?.confidence === "number" ? alternative.confidence : null,
      language: languageFromMessage(message),
      metadata: {
        deepgram: {
          duration: message.duration ?? null,
          start: message.start ?? null,
          speechFinal: message.speech_final ?? false,
          fromFinalize: message.from_finalize ?? false,
          requestId: message.metadata?.request_id ?? null,
          modelInfo: message.metadata?.model_info ?? null,
        },
      },
    };
  }
}

function isResultsMessage(message: unknown): message is ListenV1Results {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as Partial<ListenV1Results>;
  return candidate.type === "Results" && Boolean(candidate.channel?.alternatives);
}

function languageFromMessage(message: ListenV1Results): string | null {
  const alternative = message.channel.alternatives.at(0);
  const words = alternative?.words ?? [];
  const firstWordLanguage = words.find((word) => typeof word.language === "string")?.language;
  const firstAlternativeLanguage = alternative?.languages?.find((language) => typeof language === "string");

  return firstWordLanguage ?? firstAlternativeLanguage ?? null;
}
