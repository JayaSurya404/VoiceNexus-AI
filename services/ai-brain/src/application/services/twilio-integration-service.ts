import { createHmac, timingSafeEqual } from "node:crypto";

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
  statusCallbackUrl?: string | null;
  organizationId?: string;
  conversationId?: string;
  callSessionId?: string;
  apiCallSessionId?: string;
  leadId?: string;
}

export interface TwilioCallResult {
  queued: boolean;
  callSid: string | null;
  to: string;
  from: string | null;
  webhookUrl: string | null;
  status: string;
}

export interface TwilioMediaStreamTwimlInput {
  organizationId?: string;
  callSessionId?: string;
  apiCallSessionId?: string;
  leadId?: string;
  conversationId?: string;
  callSid?: string;
  gatewayHost?: string | null;
}

interface TwilioCallsClient {
  create(input: {
    to: string;
    from: string;
    url: string;
    statusCallback?: string;
    statusCallbackEvent?: string[];
    statusCallbackMethod?: "POST";
  }): Promise<{ sid: string; status?: string }>;
}

interface TwilioClient {
  calls: TwilioCallsClient;
}

type TwilioClientFactory = (accountSid: string, authToken: string) => TwilioClient;

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

  validateWebhookSignature(signature: string | undefined, url: string, params: Record<string, unknown>): boolean {
    if (!this.config.authToken) {
      return false;
    }

    if (!signature) {
      return false;
    }

    const signedPayload = Object.keys(params)
      .sort()
      .reduce((accumulator, key) => `${accumulator}${key}${this.stringValue(params[key])}`, url);
    const expectedSignature = createHmac("sha1", this.config.authToken)
      .update(signedPayload)
      .digest("base64");

    return this.safeEqual(signature, expectedSignature);
  }

  resolveWebhookOrganizationId(input: {
    queryOrganizationId?: string | null;
    body: Record<string, unknown>;
  }): string | null {
    const bodyOrganizationId =
      typeof input.body.organizationId === "string"
        ? input.body.organizationId
        : typeof input.body.OrganizationId === "string"
          ? input.body.OrganizationId
          : null;

    return input.queryOrganizationId ?? bodyOrganizationId ?? this.config.defaultOrganizationId;
  }

  async initiateOutgoingCall(input: TwilioCallRequest): Promise<TwilioCallResult> {
    if (!this.health().ready) {
      throw new Error("Twilio integration is not ready");
    }

    const from = input.from ?? this.config.fromNumber;
    const webhookUrl = this.callWebhookUrl(input.webhookUrl ?? this.config.voiceWebhookUrl, input);
    if (!this.config.accountSid || !this.config.authToken || !from || !webhookUrl) {
      throw new Error("Twilio call configuration is incomplete");
    }

    const statusCallbackUrl = input.statusCallbackUrl ?? this.statusCallbackUrl(webhookUrl);
    const client = await this.createClient();
    const call = await client.calls.create({
      to: input.to,
      from,
      url: webhookUrl,
      ...(statusCallbackUrl
        ? {
            statusCallback: statusCallbackUrl,
            statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
            statusCallbackMethod: "POST" as const,
          }
        : {}),
    });

    return {
      queued: true,
      callSid: call.sid,
      to: input.to,
      from,
      webhookUrl,
      status: call.status ?? "queued",
    };
  }

  generateMediaStreamTwiml(input: TwilioMediaStreamTwimlInput): string {
    const streamUrl = this.mediaStreamUrl(input);
    console.info("[twilio] media stream twiml", {
      organizationId: input.organizationId ?? null,
      runtimeSessionId: input.callSessionId ?? null,
      conversationId: input.conversationId ?? null,
      callSid: input.callSid ?? null,
      streamUrl,
      tokenPresent: streamUrl.includes("token="),
    });
    const parameters = [
      input.organizationId ? `<Parameter name="organizationId" value="${this.escapeXml(input.organizationId)}" />` : "",
      input.callSessionId ? `<Parameter name="callSessionId" value="${this.escapeXml(input.callSessionId)}" />` : "",
      input.apiCallSessionId ? `<Parameter name="apiCallSessionId" value="${this.escapeXml(input.apiCallSessionId)}" />` : "",
      input.leadId ? `<Parameter name="leadId" value="${this.escapeXml(input.leadId)}" />` : "",
      input.conversationId ? `<Parameter name="conversationId" value="${this.escapeXml(input.conversationId)}" />` : "",
      input.callSid ? `<Parameter name="callSid" value="${this.escapeXml(input.callSid)}" />` : "",
    ].filter((parameter) => parameter.length > 0);

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Response>",
      "  <Connect>",
      `    <Stream url="${this.escapeXml(streamUrl)}">`,
      ...parameters.map((parameter) => `      ${parameter}`),
      "    </Stream>",
      "  </Connect>",
      "</Response>",
    ].join("\n");
  }

  private async createClient(): Promise<TwilioClient> {
    if (!this.config.accountSid || !this.config.authToken) {
      throw new Error("Twilio credentials are not configured");
    }

    const twilioModule = (await import("twilio")) as { default?: TwilioClientFactory } & TwilioClientFactory;
    const createTwilioClient = twilioModule.default ?? twilioModule;
    return createTwilioClient(this.config.accountSid, this.config.authToken);
  }

  private mediaStreamUrl(input: TwilioMediaStreamTwimlInput): string {
    const configuredGatewayHost = this.gatewayHostFromPublicUrl(this.config.realtimeGatewayPublicUrl);
    const explicitGatewayHost = input.gatewayHost?.trim() ? input.gatewayHost.trim() : null;
    const fallbackPort = process.env.REALTIME_GATEWAY_PORT ?? "4001";
    const host = configuredGatewayHost ?? explicitGatewayHost ?? `localhost:${fallbackPort}`;
    const baseUrl = new URL(`wss://${host}/realtime/twilio`);
    const token = this.createMediaStreamToken(input);
    if (token) {
      baseUrl.searchParams.set("token", token);
    }
    return baseUrl.toString();
  }

  private gatewayHostFromPublicUrl(publicUrl: string | null): string | null {
    if (!publicUrl) {
      return null;
    }

    return new URL(publicUrl).host;
  }

  private createMediaStreamToken(input: TwilioMediaStreamTwimlInput): string | null {
    console.info("[twilio] media stream token input", {
      organizationId: input.organizationId ?? null,
      callSessionId: input.callSessionId ?? null,
      runtimeSessionId: input.callSessionId ?? null,
      conversationId: input.conversationId ?? null,
      mediaStreamSecretPresent: Boolean(process.env.MEDIA_STREAM_SECRET),
      mediaStreamTokenSecretPresent: Boolean(process.env.MEDIA_STREAM_TOKEN_SECRET),
      configuredMediaStreamSecretPresent: Boolean(this.config.mediaStreamSecret),
    });

    if (!input.organizationId || !input.callSessionId) {
      console.info("[twilio] media stream token skipped", {
        organizationId: input.organizationId ?? null,
        callSessionId: input.callSessionId ?? null,
        runtimeSessionId: input.callSessionId ?? null,
        conversationId: input.conversationId ?? null,
        mediaStreamSecretPresent: Boolean(process.env.MEDIA_STREAM_SECRET),
        mediaStreamTokenSecretPresent: Boolean(process.env.MEDIA_STREAM_TOKEN_SECRET),
        reason: "organizationId and callSessionId are required",
      });
      return null;
    }

    const secret = this.config.mediaStreamSecret;
    if (!secret) {
      console.info("[twilio] media stream token skipped", {
        organizationId: input.organizationId,
        callSessionId: input.callSessionId,
        runtimeSessionId: input.callSessionId,
        conversationId: input.conversationId ?? null,
        mediaStreamSecretPresent: Boolean(process.env.MEDIA_STREAM_SECRET),
        mediaStreamTokenSecretPresent: Boolean(process.env.MEDIA_STREAM_TOKEN_SECRET),
        reason: "MEDIA_STREAM_SECRET or MEDIA_STREAM_TOKEN_SECRET is required",
      });
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const payload: Record<string, string | number> = {
      organizationId: input.organizationId,
      callSessionId: input.callSessionId,
      exp: now + 60 * 10,
    };

    if (input.callSid) {
      payload.providerCallSid = input.callSid;
    }

    const token = this.signMediaStreamToken(payload, secret);
    console.info("[twilio] media stream token generated", {
      organizationId: input.organizationId,
      callSessionId: input.callSessionId,
      runtimeSessionId: input.callSessionId,
      conversationId: input.conversationId ?? null,
      providerCallSid: input.callSid ?? null,
      tokenGenerated: true,
      tokenLength: token.length,
    });
    return token;
  }

  private signMediaStreamToken(payload: Record<string, string | number>, secret: string): string {
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");
    return `${encodedPayload}.${signature}`;
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  private callWebhookUrl(
    webhookUrl: string | null,
    input: Pick<TwilioCallRequest, "organizationId" | "conversationId" | "callSessionId">,
  ): string | null {
    if (!webhookUrl) {
      return null;
    }

    const url = new URL(webhookUrl);
    if (input.organizationId) {
      url.searchParams.set("organizationId", input.organizationId);
    }
    if (input.conversationId) {
      url.searchParams.set("conversationId", input.conversationId);
    }
    if (input.callSessionId) {
      url.searchParams.set("callSessionId", input.callSessionId);
    }
    return url.toString();
  }

  private statusCallbackUrl(voiceWebhookUrl: string | null): string | null {
    if (!voiceWebhookUrl) {
      return null;
    }

    const url = new URL(voiceWebhookUrl);
    url.pathname = url.pathname.replace(/\/voice\/webhook\/?$/, "/voice/status");
    if (!url.pathname.endsWith("/voice/status")) {
      url.pathname = url.pathname.replace(/\/?$/, "/twilio/voice/status");
    }
    return url.toString();
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  private stringValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map((item) => this.stringValue(item)).join("");
    }

    if (value === undefined || value === null) {
      return "";
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    return JSON.stringify(value);
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
