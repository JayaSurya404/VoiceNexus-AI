import type { Request, Response } from "express";

import type { RecordingService } from "../../application/services/recording-service.js";
import type { TelephonyService } from "../../application/services/telephony-service.js";
import { env } from "../../config/env.js";

export class TwilioWebhookController {
  constructor(
    private readonly telephonyService: TelephonyService,
    private readonly recordingService: RecordingService,
  ) {}

  voice = async (request: Request, response: Response): Promise<void> => {
    const payload = webhookPayload(request);
    this.telephonyService.validateTwilioWebhook(signature(request), webhookUrl(request), payload);
    const twiml = await this.telephonyService.handleTwilioVoiceWebhook(payload);
    response.type("text/xml").status(200).send(twiml);
  };

  status = async (request: Request, response: Response): Promise<void> => {
    const payload = webhookPayload(request);
    this.telephonyService.validateTwilioWebhook(signature(request), webhookUrl(request), payload);
    await this.telephonyService.handleTwilioStatusWebhook(payload);
    response.status(204).send();
  };

  recording = async (request: Request, response: Response): Promise<void> => {
    const payload = webhookPayload(request);
    this.telephonyService.validateTwilioWebhook(signature(request), webhookUrl(request), payload);
    await this.recordingService.handleTwilioRecordingWebhook(payload);
    response.status(204).send();
  };
}

function webhookPayload(request: Request): Record<string, unknown> {
  return request.body && typeof request.body === "object" ? (request.body as Record<string, unknown>) : {};
}

function signature(request: Request): string | undefined {
  const value = request.header("x-twilio-signature");
  return value ?? undefined;
}

function webhookUrl(request: Request): string {
  return `${env.API_PUBLIC_URL}${request.originalUrl}`;
}
