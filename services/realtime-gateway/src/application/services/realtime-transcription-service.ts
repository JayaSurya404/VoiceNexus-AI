import type { DeepgramStreamManager } from "../../infrastructure/deepgram/deepgram-stream-manager.js";

export interface StartRealtimeTranscriptionInput {
  aiConversationSessionId: string | null;
  callSessionId: string;
  organizationId: string;
  streamSid: string | null;
}

export interface TwilioAudioFrameInput {
  base64Payload: string;
  callSessionId: string;
}

export class RealtimeTranscriptionService {
  constructor(private readonly deepgramStreams: DeepgramStreamManager) {}

  async start(input: StartRealtimeTranscriptionInput): Promise<void> {
    await this.deepgramStreams.start(input);
  }

  async acceptTwilioAudio(input: TwilioAudioFrameInput): Promise<void> {
    if (!input.base64Payload.trim()) {
      console.warn(`[transcription] Empty Twilio media payload for call ${input.callSessionId}`);
      return;
    }

    await this.deepgramStreams.sendAudio(input.callSessionId, Buffer.from(input.base64Payload, "base64"));
  }

  async stop(callSessionId: string, reason: string): Promise<void> {
    await this.deepgramStreams.stop(callSessionId, reason);
  }
}
