import type { AudioSegment } from "../../domain/entities/audio-segment.js";

export interface PlaybackConnection {
  streamSid: string | null;
  send: (payload: Record<string, unknown>) => void;
}

export class AudioPlaybackService {
  private readonly connections = new Map<string, PlaybackConnection>();

  register(callId: string, connection: PlaybackConnection): void {
    this.connections.set(callId, connection);
    console.info("[audio-playback] connection registered", {
      callId,
      streamSid: connection.streamSid,
    });
  }

  unregister(callId: string): void {
    this.connections.delete(callId);
    console.info("[audio-playback] connection unregistered", {
      callId,
    });
  }

  play(segment: AudioSegment): boolean {
    const connection = this.connections.get(segment.callId);
    if (!connection?.streamSid) {
      console.warn("[audio-playback] playback unavailable", {
        callId: segment.callId,
        voiceResponseId: segment.voiceResponseId,
        hasConnection: Boolean(connection),
        streamSid: connection?.streamSid ?? null,
      });
      return false;
    }

    console.info("[audio-playback] sending media", {
      callId: segment.callId,
      voiceResponseId: segment.voiceResponseId,
      streamSid: connection.streamSid,
      mimeType: segment.mimeType,
      payloadBytes: Buffer.byteLength(segment.base64Audio, "base64"),
    });
    connection.send({
      event: "media",
      streamSid: connection.streamSid,
      media: { payload: segment.base64Audio },
    });
    connection.send({
      event: "mark",
      streamSid: connection.streamSid,
      mark: { name: `voice-response-${segment.voiceResponseId}-${segment.sequence}` },
    });
    return true;
  }

  clear(callId: string): boolean {
    const connection = this.connections.get(callId);
    if (!connection?.streamSid) {
      return false;
    }

    connection.send({
      event: "clear",
      streamSid: connection.streamSid,
    });
    return true;
  }
}
