export interface AudioSegment {
  id: string;
  voiceResponseId: string;
  callId: string;
  sequence: number;
  mimeType: string;
  base64Audio: string;
  durationMs: number;
  createdAt: Date;
}
