import type { Request, Response } from "express";
import {
  OrganizationScopedQuerySchema,
  type CreateConversationMemoryPayload,
  type CreateCustomerMemoryPayload,
  type CreateCustomerPreferencePayload,
  type CreateTimelineEventPayload,
} from "@voicenexus/contracts";

import type { MemoryService } from "../../application/services/memory-service.js";
import { AppError } from "../../shared/app-error.js";

export class MemoryController {
  constructor(private readonly memoryService: MemoryService) {}

  listMemories = async (request: Request, response: Response): Promise<void> => {
    const memories = await this.memoryService.listMemories(
      actor(request),
      OrganizationScopedQuerySchema.parse(request.query),
    );
    response.status(200).json({ data: memories, requestId: request.requestId });
  };

  createMemory = async (request: Request, response: Response): Promise<void> => {
    const input = bodyAs<CreateCustomerMemoryPayload | CreateConversationMemoryPayload>(request);
    const memory =
      "summary" in input
        ? await this.memoryService.upsertMemory(actor(request), input)
        : await this.memoryService.createConversationMemory(actor(request), input);

    response.status(201).json({ data: memory, requestId: request.requestId });
  };

  getMemoryByLead = async (request: Request, response: Response): Promise<void> => {
    const organizationId = organizationIdFromQuery(request);
    const bundle = await this.memoryService.getMemoryBundle(actor(request), organizationId, leadIdParam(request));
    response.status(200).json({ data: bundle, requestId: request.requestId });
  };

  getTimelineByLead = async (request: Request, response: Response): Promise<void> => {
    const organizationId = organizationIdFromQuery(request);
    const events = await this.memoryService.listTimeline(actor(request), organizationId, leadIdParam(request));
    response.status(200).json({ data: events, requestId: request.requestId });
  };

  createTimelineEvent = async (request: Request, response: Response): Promise<void> => {
    const event = await this.memoryService.createTimelineEvent(
      actor(request),
      bodyAs<CreateTimelineEventPayload>(request),
    );
    response.status(201).json({ data: event, requestId: request.requestId });
  };

  getPreferencesByLead = async (request: Request, response: Response): Promise<void> => {
    const organizationId = organizationIdFromQuery(request);
    const preferences = await this.memoryService.getPreferences(actor(request), organizationId, leadIdParam(request));
    response.status(200).json({ data: preferences, requestId: request.requestId });
  };

  upsertPreferences = async (request: Request, response: Response): Promise<void> => {
    const preferences = await this.memoryService.upsertPreferences(
      actor(request),
      bodyAs<CreateCustomerPreferencePayload>(request),
    );
    response.status(201).json({ data: preferences, requestId: request.requestId });
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

function leadIdParam(request: Request): string {
  const leadId = request.params.leadId;

  if (typeof leadId !== "string") {
    throw AppError.badRequest("INVALID_LEAD_ID", "A lead id is required");
  }

  return leadId;
}

function organizationIdFromQuery(request: Request): string {
  return OrganizationScopedQuerySchema.parse(request.query).organizationId;
}
