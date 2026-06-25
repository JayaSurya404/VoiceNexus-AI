import type { Request, Response } from "express";
import {
  ListWhatsappQuerySchema,
  type CreateWhatsappAutomationPayload,
  type CreateWhatsappBroadcastPayload,
  type CreateWhatsappContactPayload,
  type CreateWhatsappConversationPayload,
  type CreateWhatsappTemplatePayload,
  type SendWhatsappMessagePayload,
  type UpdateWhatsappContactPayload,
  type UpdateWhatsappConversationPayload,
} from "@voicenexus/contracts";

import type { WhatsappService } from "../../application/services/whatsapp-service.js";
import { AppError } from "../../shared/app-error.js";

export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  dashboard = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.dashboard(actor(request), organizationIdFromQuery(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  listContacts = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.listContacts(actor(request), ListWhatsappQuerySchema.parse(request.query));
    response.status(200).json({ data, requestId: request.requestId });
  };

  createContact = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.createContact(actor(request), bodyAs<CreateWhatsappContactPayload>(request));
    response.status(201).json({ data, requestId: request.requestId });
  };

  updateContact = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.updateContact(
      actor(request),
      idParam(request),
      bodyAs<UpdateWhatsappContactPayload>(request),
    );
    response.status(200).json({ data, requestId: request.requestId });
  };

  listConversations = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.listConversations(
      actor(request),
      ListWhatsappQuerySchema.parse(request.query),
    );
    response.status(200).json({ data, requestId: request.requestId });
  };

  createConversation = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.createConversation(
      actor(request),
      bodyAs<CreateWhatsappConversationPayload>(request),
    );
    response.status(201).json({ data, requestId: request.requestId });
  };

  getConversation = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.getConversation(
      actor(request),
      organizationIdFromQuery(request),
      idParam(request),
    );
    response.status(200).json({ data, requestId: request.requestId });
  };

  updateConversation = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.updateConversation(
      actor(request),
      idParam(request),
      bodyAs<UpdateWhatsappConversationPayload>(request),
    );
    response.status(200).json({ data, requestId: request.requestId });
  };

  sendMessage = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.sendMessage(actor(request), bodyAs<SendWhatsappMessagePayload>(request));
    response.status(201).json({ data, requestId: request.requestId });
  };

  listTemplates = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.listTemplates(actor(request), organizationIdFromQuery(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  createTemplate = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.createTemplate(
      actor(request),
      bodyAs<CreateWhatsappTemplatePayload>(request),
    );
    response.status(201).json({ data, requestId: request.requestId });
  };

  listBroadcasts = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.listBroadcasts(actor(request), organizationIdFromQuery(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  createBroadcast = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.createBroadcast(
      actor(request),
      bodyAs<CreateWhatsappBroadcastPayload>(request),
    );
    response.status(201).json({ data, requestId: request.requestId });
  };

  listAutomations = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.listAutomations(actor(request), organizationIdFromQuery(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  createAutomation = async (request: Request, response: Response): Promise<void> => {
    const data = await this.whatsappService.createAutomation(
      actor(request),
      bodyAs<CreateWhatsappAutomationPayload>(request),
    );
    response.status(201).json({ data, requestId: request.requestId });
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

function bodyAs<T>(request: Request): T {
  return request.validatedBody as T;
}

function idParam(request: Request): string {
  const id = request.params.id;
  if (typeof id !== "string") {
    throw AppError.badRequest("INVALID_ID", "A record id is required");
  }
  return id;
}

function organizationIdFromQuery(request: Request): string {
  return ListWhatsappQuerySchema.parse(request.query).organizationId;
}
