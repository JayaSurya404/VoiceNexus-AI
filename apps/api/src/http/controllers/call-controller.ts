import type { Request, Response } from "express";
import type { CreateOutboundCallPayload, TransferCallPayload } from "@voicenexus/contracts";

import type { CallSessionService } from "../../application/services/call-session-service.js";
import type { TelephonyService } from "../../application/services/telephony-service.js";
import { AppError } from "../../shared/app-error.js";
import { CallOrganizationQuerySchema, CallsQuerySchema } from "../validators/telephony-validators.js";

export class CallController {
  constructor(
    private readonly telephonyService: TelephonyService,
    private readonly callSessionService: CallSessionService,
  ) {}

  createOutboundCall = async (request: Request, response: Response): Promise<void> => {
    const call = await this.telephonyService.startOutboundCall(
      actor(request),
      request.validatedBody as CreateOutboundCallPayload,
    );
    response.status(201).json({ data: call, requestId: request.requestId });
  };

  transferCall = async (request: Request, response: Response): Promise<void> => {
    const transfer = await this.telephonyService.transferCall(
      actor(request),
      request.validatedBody as TransferCallPayload,
    );
    response.status(201).json({ data: transfer, requestId: request.requestId });
  };

  listCalls = async (request: Request, response: Response): Promise<void> => {
    const calls = await this.callSessionService.listCalls(actor(request), CallsQuerySchema.parse(request.query));
    response.status(200).json({ data: calls, requestId: request.requestId });
  };

  getCall = async (request: Request, response: Response): Promise<void> => {
    const organizationId = CallOrganizationQuerySchema.parse(request.query).organizationId;
    const details = await this.callSessionService.getCallDetails(actor(request), organizationId, idParam(request));
    response.status(200).json({ data: details, requestId: request.requestId });
  };

  getCallEvents = async (request: Request, response: Response): Promise<void> => {
    const organizationId = CallOrganizationQuerySchema.parse(request.query).organizationId;
    const events = await this.callSessionService.listCallEvents(actor(request), organizationId, idParam(request));
    response.status(200).json({ data: events, requestId: request.requestId });
  };
}

function actor(request: Request) {
  if (!request.auth) {
    throw AppError.unauthorized();
  }

  return {
    userId: request.auth.userId,
    platformRole: request.auth.platformRole,
  };
}

function idParam(request: Request): string {
  const id = request.params.id;

  if (typeof id !== "string") {
    throw AppError.badRequest("INVALID_CALL_ID", "A call id is required");
  }

  return id;
}
