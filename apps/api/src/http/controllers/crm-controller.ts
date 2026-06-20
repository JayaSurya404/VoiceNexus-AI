import type { Request, Response } from "express";
import {
  ListLeadsQuerySchema,
  OrganizationScopedQuerySchema,
  type CreateActivityPayload,
  type CreateContactPayload,
  type CreateLeadPayload,
  type CreateNotePayload,
  type CreateTagPayload,
  type UpdateLeadPayload,
} from "@voicenexus/contracts";

import type { CrmService } from "../../application/services/crm-service.js";
import { AppError } from "../../shared/app-error.js";

export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  listLeads = async (request: Request, response: Response): Promise<void> => {
    const leads = await this.crmService.listLeads(
      actor(request),
      ListLeadsQuerySchema.parse(request.query),
    );
    response.status(200).json({ data: leads, requestId: request.requestId });
  };

  createLead = async (request: Request, response: Response): Promise<void> => {
    const lead = await this.crmService.createLead(actor(request), bodyAs<CreateLeadPayload>(request));
    response.status(201).json({ data: lead, requestId: request.requestId });
  };

  getLeadById = async (request: Request, response: Response): Promise<void> => {
    const organizationId = organizationIdFromQuery(request);
    const lead = await this.crmService.getLeadById(actor(request), organizationId, idParam(request));
    response.status(200).json({ data: lead, requestId: request.requestId });
  };

  updateLead = async (request: Request, response: Response): Promise<void> => {
    const lead = await this.crmService.updateLead(
      actor(request),
      idParam(request),
      bodyAs<UpdateLeadPayload>(request),
    );
    response.status(200).json({ data: lead, requestId: request.requestId });
  };

  deleteLead = async (request: Request, response: Response): Promise<void> => {
    await this.crmService.deleteLead(actor(request), organizationIdFromQuery(request), idParam(request));
    response.status(204).send();
  };

  listContacts = async (request: Request, response: Response): Promise<void> => {
    const contacts = await this.crmService.listContacts(
      actor(request),
      OrganizationScopedQuerySchema.parse(request.query),
    );
    response.status(200).json({ data: contacts, requestId: request.requestId });
  };

  createContact = async (request: Request, response: Response): Promise<void> => {
    const contact = await this.crmService.createContact(actor(request), bodyAs<CreateContactPayload>(request));
    response.status(201).json({ data: contact, requestId: request.requestId });
  };

  listActivities = async (request: Request, response: Response): Promise<void> => {
    const activities = await this.crmService.listActivities(
      actor(request),
      OrganizationScopedQuerySchema.parse(request.query),
    );
    response.status(200).json({ data: activities, requestId: request.requestId });
  };

  createActivity = async (request: Request, response: Response): Promise<void> => {
    const activity = await this.crmService.createActivity(
      actor(request),
      bodyAs<CreateActivityPayload>(request),
    );
    response.status(201).json({ data: activity, requestId: request.requestId });
  };

  listNotes = async (request: Request, response: Response): Promise<void> => {
    const notes = await this.crmService.listNotes(
      actor(request),
      OrganizationScopedQuerySchema.parse(request.query),
    );
    response.status(200).json({ data: notes, requestId: request.requestId });
  };

  createNote = async (request: Request, response: Response): Promise<void> => {
    const note = await this.crmService.createNote(actor(request), bodyAs<CreateNotePayload>(request));
    response.status(201).json({ data: note, requestId: request.requestId });
  };

  listTags = async (request: Request, response: Response): Promise<void> => {
    const tags = await this.crmService.listTags(
      actor(request),
      OrganizationScopedQuerySchema.parse(request.query),
    );
    response.status(200).json({ data: tags, requestId: request.requestId });
  };

  createTag = async (request: Request, response: Response): Promise<void> => {
    const tag = await this.crmService.createTag(actor(request), bodyAs<CreateTagPayload>(request));
    response.status(201).json({ data: tag, requestId: request.requestId });
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
  return OrganizationScopedQuerySchema.parse(request.query).organizationId;
}
