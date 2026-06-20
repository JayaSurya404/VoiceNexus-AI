import type { EventBus } from "../../application/ports/event-bus.js";
import type { TranscriptPersistenceService } from "../../application/services/transcript-persistence-service.js";
import type { DeepgramClient, DeepgramLiveStream } from "./deepgram-client.js";
import { DeepgramTranscriptAdapter } from "./deepgram-transcript-adapter.js";

interface DeepgramStreamContext {
  aiConversationSessionId: string | null;
  callSessionId: string;
  organizationId: string;
  streamSid: string | null;
}

interface ManagedDeepgramStream {
  context: DeepgramStreamContext;
  pendingAudioFrames: Buffer[];
  reconnectAttempts: number;
  sequenceNumber: number;
  socket: DeepgramLiveStream | null;
  state: "CONNECTING" | "CONNECTED" | "FAILED" | "CLOSED";
}

const MAX_RECONNECT_ATTEMPTS = 2;
const MAX_PENDING_AUDIO_FRAMES = 50;

export class DeepgramStreamManager {
  private readonly streams = new Map<string, ManagedDeepgramStream>();
  private readonly adapter = new DeepgramTranscriptAdapter();

  constructor(
    private readonly client: DeepgramClient,
    private readonly transcripts: TranscriptPersistenceService,
    private readonly eventBus: EventBus,
  ) {}

  async start(context: DeepgramStreamContext): Promise<void> {
    const existing = this.streams.get(context.callSessionId);

    if (existing?.state === "CONNECTED" || existing?.state === "CONNECTING") {
      existing.context = context;
      return;
    }

    const managed: ManagedDeepgramStream = existing ?? {
      context,
      pendingAudioFrames: [],
      reconnectAttempts: 0,
      sequenceNumber: 0,
      socket: null,
      state: "CONNECTING",
    };
    managed.context = context;
    managed.state = "CONNECTING";
    this.streams.set(context.callSessionId, managed);

    await this.openSocket(managed);
  }

  async sendAudio(callSessionId: string, audio: Buffer): Promise<void> {
    if (!audio.length) {
      console.warn(`[deepgram] Ignoring empty audio frame for call ${callSessionId}`);
      return;
    }

    const managed = this.streams.get(callSessionId);

    if (!managed) {
      console.warn(`[deepgram] Received audio before stream start for call ${callSessionId}`);
      return;
    }

    if (managed.state === "FAILED" && managed.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      await this.reconnect(managed);
    }

    if (managed.state !== "CONNECTED" || !managed.socket) {
      this.bufferAudioFrame(managed, audio);
      console.warn(`[deepgram] Buffered audio frame while stream is ${managed.state} for call ${callSessionId}`);
      return;
    }

    managed.socket.sendAudio(audio);
  }

  async stop(callSessionId: string, reason: string): Promise<void> {
    const managed = this.streams.get(callSessionId);

    if (!managed) {
      return;
    }

    try {
      managed.socket?.finalize();
      managed.socket?.close();
    } catch (error) {
      console.warn(`[deepgram] Error while closing stream for call ${callSessionId}: ${errorMessage(error)}`);
    }

    managed.state = "CLOSED";
    this.streams.delete(callSessionId);
    await this.eventBus.publish("call.lifecycle", {
      organizationId: managed.context.organizationId,
      callSessionId,
      payload: {
        type: "DEEPGRAM_CLOSED",
        reason,
      },
    });
  }

  private async openSocket(managed: ManagedDeepgramStream): Promise<void> {
    try {
      managed.state = "CONNECTING";
      const socket = await this.client.createLiveStream({
        callSessionId: managed.context.callSessionId,
        organizationId: managed.context.organizationId,
      });
      managed.socket = socket;
      this.attachHandlers(managed, socket);
      socket.onOpen(() => {
        managed.state = "CONNECTED";
        console.log(`[deepgram] Connected stream for call ${managed.context.callSessionId}`);
        this.flushPendingAudio(managed);
        void this.eventBus.publish("call.lifecycle", {
          organizationId: managed.context.organizationId,
          callSessionId: managed.context.callSessionId,
          payload: {
            type: "DEEPGRAM_CONNECTED",
            streamSid: managed.context.streamSid,
          },
        });
      });
      socket.onError((error) => {
        managed.state = "FAILED";
        console.error(`[deepgram] Stream error for call ${managed.context.callSessionId}: ${error.message}`);
        void this.eventBus.publish("call.lifecycle", {
          organizationId: managed.context.organizationId,
          callSessionId: managed.context.callSessionId,
          payload: {
            type: "DEEPGRAM_ERROR",
            message: error.message,
          },
        });
      });
      socket.connect();
    } catch (error) {
      managed.state = "FAILED";
      console.error(`[deepgram] Could not open stream for call ${managed.context.callSessionId}: ${errorMessage(error)}`);
      await this.eventBus.publish("call.lifecycle", {
        organizationId: managed.context.organizationId,
        callSessionId: managed.context.callSessionId,
        payload: {
          type: "DEEPGRAM_ERROR",
          message: errorMessage(error),
        },
      });
    }
  }

  private attachHandlers(managed: ManagedDeepgramStream, socket: DeepgramLiveStream): void {
    socket.onMessage((message) => {
      const transcript = this.adapter.fromMessage(message);

      if (!transcript) {
        return;
      }

      managed.sequenceNumber += 1;
      void this.transcripts.handleTranscript({
        aiConversationSessionId: managed.context.aiConversationSessionId,
        callSessionId: managed.context.callSessionId,
        confidence: transcript.confidence,
        language: transcript.language,
        metadata: {
          ...transcript.metadata,
          streamSid: managed.context.streamSid,
        },
        organizationId: managed.context.organizationId,
        sequenceNumber: managed.sequenceNumber,
        speaker: "CUSTOMER",
        text: transcript.text,
        type: transcript.isFinal ? "FINAL" : "PARTIAL",
      });
    });
    socket.onClose((event) => {
      if (managed.state !== "CLOSED") {
        managed.state = "FAILED";
      }

      console.warn(`[deepgram] Stream closed for call ${managed.context.callSessionId}: ${JSON.stringify(event)}`);
      void this.eventBus.publish("call.lifecycle", {
        organizationId: managed.context.organizationId,
        callSessionId: managed.context.callSessionId,
        payload: {
          type: "DEEPGRAM_DISCONNECTED",
          streamSid: managed.context.streamSid,
        },
      });
    });
  }

  private async reconnect(managed: ManagedDeepgramStream): Promise<void> {
    managed.reconnectAttempts += 1;
    console.warn(
      `[deepgram] Reconnecting stream for call ${managed.context.callSessionId}, attempt ${managed.reconnectAttempts}`,
    );
    managed.socket?.close();
    await this.openSocket(managed);
  }

  private bufferAudioFrame(managed: ManagedDeepgramStream, audio: Buffer): void {
    managed.pendingAudioFrames.push(audio);

    if (managed.pendingAudioFrames.length > MAX_PENDING_AUDIO_FRAMES) {
      managed.pendingAudioFrames.splice(0, managed.pendingAudioFrames.length - MAX_PENDING_AUDIO_FRAMES);
    }
  }

  private flushPendingAudio(managed: ManagedDeepgramStream): void {
    if (!managed.socket || managed.pendingAudioFrames.length === 0) {
      return;
    }

    const frames = managed.pendingAudioFrames.splice(0);

    for (const frame of frames) {
      managed.socket.sendAudio(frame);
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown Deepgram error";
}
