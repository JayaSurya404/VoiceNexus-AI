import type { AudioSegment } from "../../domain/entities/audio-segment.js";

export interface PlaybackConnection {
  streamSid: string | null;
  send: (payload: Record<string, unknown>) => void;
}

export class AudioPlaybackService {
  private readonly connections = new Map<string, PlaybackConnection>();

  register(callId: string, connection: PlaybackConnection): void {
    this.connections.set(callId, connection);
  }

  unregister(callId: string): void {
    this.connections.delete(callId);
  }

  play(segment: AudioSegment): boolean {
    const connection = this.connections.get(segment.callId);
    if (!connection?.streamSid) {
      return false;
    }

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
}
