import type { AudioBufferService } from "./audio-buffer-service.js";
import type { AudioPlaybackService } from "./audio-playback-service.js";

export interface AudioInterruptResult {
  queuedSegmentsCleared: number;
  playbackCleared: boolean;
}

export class AudioInterruptService {
  constructor(
    private readonly buffer: AudioBufferService,
    private readonly playback: AudioPlaybackService,
  ) {}

  interrupt(callSessionId: string): AudioInterruptResult {
    return {
      queuedSegmentsCleared: this.buffer.clear(callSessionId),
      playbackCleared: this.playback.clear(callSessionId),
    };
  }
}
