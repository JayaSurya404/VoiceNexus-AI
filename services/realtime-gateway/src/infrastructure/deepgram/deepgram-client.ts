import { DeepgramClient as DeepgramSdkClient } from "@deepgram/sdk";
import type { V1Socket } from "@deepgram/sdk/listen/v1";

export interface DeepgramLiveStreamOptions {
  callSessionId: string;
  organizationId: string;
}

export type DeepgramLiveMessage = V1Socket.Response;

export interface DeepgramLiveStream {
  close: () => void;
  connect: () => void;
  finalize: () => void;
  keepAlive: () => void;
  onClose: (handler: (event: unknown) => void) => void;
  onError: (handler: (error: Error) => void) => void;
  onMessage: (handler: (message: DeepgramLiveMessage) => void) => void;
  onOpen: (handler: () => void) => void;
  sendAudio: (audio: Buffer) => void;
}

export class DeepgramClient {
  private readonly sdk: DeepgramSdkClient;

  constructor(private readonly apiKey: string) {
    this.sdk = new DeepgramSdkClient({ apiKey });
  }

  async createLiveStream(input: DeepgramLiveStreamOptions): Promise<DeepgramLiveStream> {
    const socket = await this.sdk.listen.v1.connect({
      model: "nova-3",
      encoding: "mulaw",
      sample_rate: 8000,
      channels: 1,
      interim_results: "true",
      punctuate: "true",
      smart_format: "true",
      endpointing: 300,
      vad_events: "true",
      reconnectAttempts: 3,
      connectionTimeoutInSeconds: 10,
      tag: [`organization:${input.organizationId}`, `call:${input.callSessionId}`],
      Authorization: this.apiKey,
    });

    return new DeepgramLiveSocket(socket);
  }
}

class DeepgramLiveSocket implements DeepgramLiveStream {
  constructor(private readonly socket: V1Socket) {}

  close(): void {
    this.socket.close();
  }

  connect(): void {
    this.socket.connect();
  }

  finalize(): void {
    this.socket.sendFinalize({ type: "Finalize" });
  }

  keepAlive(): void {
    this.socket.sendKeepAlive({ type: "KeepAlive" });
  }

  onClose(handler: (event: unknown) => void): void {
    this.socket.on("close", handler);
  }

  onError(handler: (error: Error) => void): void {
    this.socket.on("error", handler);
  }

  onMessage(handler: (message: DeepgramLiveMessage) => void): void {
    this.socket.on("message", handler);
  }

  onOpen(handler: () => void): void {
    this.socket.on("open", handler);
  }

  sendAudio(audio: Buffer): void {
    this.socket.sendMedia(audio);
  }
}
