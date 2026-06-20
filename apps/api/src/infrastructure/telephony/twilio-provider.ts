import { createHmac, timingSafeEqual } from "node:crypto";

import type {
  OutboundCallRequest,
  OutboundCallResult,
  TelephonyProvider,
  TransferCallRequest,
} from "../../application/ports/telephony-provider.js";
import { AppError } from "../../shared/app-error.js";

interface TwilioProviderConfig {
  accountSid: string;
  authToken: string;
}

interface TwilioCallResponse {
  sid?: string;
  status?: string;
  message?: string;
}

export class TwilioProvider implements TelephonyProvider {
  constructor(private readonly config: TwilioProviderConfig) {}

  async createOutboundCall(input: OutboundCallRequest): Promise<OutboundCallResult> {
    this.ensureConfigured();

    const payload = new URLSearchParams({
      To: input.to,
      From: input.from,
      Url: input.voiceUrl,
      Method: "POST",
      StatusCallback: input.statusCallbackUrl,
      StatusCallbackMethod: "POST",
      RecordingStatusCallback: input.recordingStatusCallbackUrl,
      RecordingStatusCallbackMethod: "POST",
      Record: input.record ? "true" : "false",
    });
    payload.append("StatusCallbackEvent", "initiated");
    payload.append("StatusCallbackEvent", "ringing");
    payload.append("StatusCallbackEvent", "answered");
    payload.append("StatusCallbackEvent", "completed");

    const response = await fetch(`${this.callsUrl()}.json`, {
      method: "POST",
      headers: this.headers(),
      body: payload,
    });
    const body = (await response.json()) as TwilioCallResponse;

    if (!response.ok || !body.sid) {
      throw AppError.badRequest(
        "TWILIO_OUTBOUND_FAILED",
        body.message ?? "Twilio could not create the outbound call",
      );
    }

    return {
      providerCallSid: body.sid,
      providerStatus: body.status ?? "queued",
    };
  }

  async transferCall(input: TransferCallRequest): Promise<void> {
    this.ensureConfigured();

    const payload = new URLSearchParams({
      Twiml: `<Response><Dial>${escapeXml(input.toPhoneNumber)}</Dial></Response>`,
      Method: "POST",
    });
    const response = await fetch(`${this.callsUrl()}/${encodeURIComponent(input.providerCallSid)}.json`, {
      method: "POST",
      headers: this.headers(),
      body: payload,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as TwilioCallResponse;
      throw AppError.badRequest("TWILIO_TRANSFER_FAILED", body.message ?? "Twilio could not transfer the call");
    }
  }

  buildVoiceResponse(message: string): string {
    return `<Response><Say voice="alice">${escapeXml(message)}</Say></Response>`;
  }

  validateWebhookSignature(signature: string | undefined, url: string, params: Record<string, unknown>): boolean {
    if (!this.config.authToken) {
      return true;
    }

    if (!signature) {
      return false;
    }

    const signedPayload = Object.keys(params)
      .sort()
      .reduce((accumulator, key) => `${accumulator}${key}${stringValue(params[key])}`, url);
    const expectedSignature = createHmac("sha1", this.config.authToken)
      .update(signedPayload)
      .digest("base64");

    return safeEqual(signature, expectedSignature);
  }

  private callsUrl(): string {
    return `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(this.config.accountSid)}/Calls`;
  }

  private headers(): Headers {
    const headers = new Headers();
    headers.set("content-type", "application/x-www-form-urlencoded");
    headers.set(
      "authorization",
      `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString("base64")}`,
    );
    return headers;
  }

  private ensureConfigured(): void {
    if (!this.config.accountSid || !this.config.authToken) {
      throw AppError.badRequest(
        "TWILIO_NOT_CONFIGURED",
        "Twilio credentials are required before placing or transferring calls",
      );
    }
  }
}

function stringValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(stringValue).join("");
  }

  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
