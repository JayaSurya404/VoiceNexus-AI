export interface TtsRequest {
  organizationId: string;
  voiceResponseId: string;
  text: string;
  voice: string | null;
}
