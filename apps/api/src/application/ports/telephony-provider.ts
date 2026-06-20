export interface OutboundCallRequest {
  to: string;
  from: string;
  voiceUrl: string;
  statusCallbackUrl: string;
  recordingStatusCallbackUrl: string;
  record: boolean;
}

export interface OutboundCallResult {
  providerCallSid: string;
  providerStatus: string;
}

export interface TransferCallRequest {
  providerCallSid: string;
  toPhoneNumber: string;
}

export interface TelephonyProvider {
  createOutboundCall(input: OutboundCallRequest): Promise<OutboundCallResult>;
  transferCall(input: TransferCallRequest): Promise<void>;
  buildVoiceResponse(message: string): string;
  validateWebhookSignature(signature: string | undefined, url: string, params: Record<string, unknown>): boolean;
}
