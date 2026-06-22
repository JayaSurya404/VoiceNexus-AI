import { randomUUID } from "node:crypto";

import type { AudioSegment } from "../../domain/entities/audio-segment.js";

export class AudioBufferService {
  private readonly queues = new Map<string, AudioSegment[]>();

  queue(callId: string, input: Omit<AudioSegment, "id" | "createdAt">): AudioSegment {
    const segment: AudioSegment = { ...input, id: randomUUID(), createdAt: new Date() };
    const current = this.queues.get(callId) ?? [];
    current.push(segment);
    this.queues.set(callId, current);
    return segment;
  }

  dequeue(callId: string): AudioSegment | null {
    const current = this.queues.get(callId) ?? [];
    const next = current.shift() ?? null;
    if (current.length) this.queues.set(callId, current);
    else this.queues.delete(callId);
    return next;
  }

  list(callId: string): AudioSegment[] {
    return this.queues.get(callId) ?? [];
  }

  clear(callId: string): number {
    const current = this.queues.get(callId) ?? [];
    this.queues.delete(callId);
    return current.length;
  }
}
