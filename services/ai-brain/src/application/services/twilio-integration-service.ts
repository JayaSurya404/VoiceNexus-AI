import type { InfrastructureConfig } from "../../config/infrastructure-config.js";

export interface TwilioVoiceWebhook {
  callSid: string;
  from: string;
  to: string;
  callStatus: string;
  direction: string;
  raw: Record<string, unknown>;
}

export interface TwilioCallRequest {
  to: string;
  from?: string | null;
  webhookUrl?: string | null;
}

export class TwilioIntegrationService {
  constructor(private readonly config: InfrastructureConfig["twilio"]) {}

  health(): { provider: "twilio"; ready: boolean; message: string } {
    const ready = Boolean(this.config.accountSid && this.config.authToken && this.config.fromNumber && this.config.voiceWebhookUrl);
    return {
      provider: "twilio",
      ready,
      message: ready ? "Twilio voice integration configured" : "Twilio credentials, from number, or webhook URL missing",
    };
  }

  parseVoiceWebhook(input: Record<string, unknown>): TwilioVoiceWebhook {
    return {
      callSid: String(input.CallSid ?? input.callSid ?? ""),
      from: String(input.From ?? input.from ?? ""),
      to: String(input.To ?? input.to ?? ""),
      callStatus: String(input.CallStatus ?? input.callStatus ?? "unknown"),
      direction: String(input.Direction ?? input.direction ?? "inbound"),
      raw: input,
    };
  }

  initiateOutgoingCall(input: TwilioCallRequest): { queued: boolean; to: string; from: string | null; webhookUrl: string | null } {
    if (!this.health().ready) {
      throw new Error("Twilio integration is not ready");
    }

    return {
      queued: true,
      to: input.to,
      from: input.from ?? this.config.fromNumber,
      webhookUrl: input.webhookUrl ?? this.config.voiceWebhookUrl,
    };
  }
}
