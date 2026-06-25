import type { Request, Response } from "express";
import {
  ListAgentsQuerySchema,
  type CreateAgentPayload,
  type CreateAgentPersonaPayload,
  type CreateAgentSkillPayload,
  type TestAgentPayload,
  type UpdateAgentPayload,
  type UpdateAgentPersonaPayload,
  type UpdateAgentSkillPayload,
  type UpsertAgentAvailabilityPayload,
} from "@voicenexus/contracts";

import type { AgentWorkspaceService } from "../../application/services/agent-workspace-service.js";
import { AppError } from "../../shared/app-error.js";

export class AgentWorkspaceController {
  constructor(private readonly agentService: AgentWorkspaceService) {}

  dashboard = async (request: Request, response: Response) => {
    const data = await this.agentService.dashboard(actor(request), organizationIdFromQuery(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  listAgents = async (request: Request, response: Response) => {
    const data = await this.agentService.listAgents(actor(request), ListAgentsQuerySchema.parse(request.query));
    response.status(200).json({ data, requestId: request.requestId });
  };

  createAgent = async (request: Request, response: Response) => {
    const data = await this.agentService.createAgent(actor(request), bodyAs<CreateAgentPayload>(request));
    response.status(201).json({ data, requestId: request.requestId });
  };

  getAgent = async (request: Request, response: Response) => {
    const data = await this.agentService.details(actor(request), organizationIdFromQuery(request), idParam(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  updateAgent = async (request: Request, response: Response) => {
    const data = await this.agentService.updateAgent(actor(request), idParam(request), bodyAs<UpdateAgentPayload>(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  deleteAgent = async (request: Request, response: Response) => {
    await this.agentService.deleteAgent(actor(request), organizationIdFromQuery(request), idParam(request));
    response.status(204).send();
  };

  listPersonas = async (request: Request, response: Response) => {
    const data = await this.agentService.listPersonas(actor(request), organizationIdFromQuery(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  createPersona = async (request: Request, response: Response) => {
    const data = await this.agentService.createPersona(actor(request), bodyAs<CreateAgentPersonaPayload>(request));
    response.status(201).json({ data, requestId: request.requestId });
  };

  updatePersona = async (request: Request, response: Response) => {
    const data = await this.agentService.updatePersona(actor(request), idParam(request), bodyAs<UpdateAgentPersonaPayload>(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  listSkills = async (request: Request, response: Response) => {
    const query = ListAgentsQuerySchema.parse(request.query);
    const data = await this.agentService.listSkills(actor(request), query.organizationId, typeof request.query.agentId === "string" ? request.query.agentId : undefined);
    response.status(200).json({ data, requestId: request.requestId });
  };

  createSkill = async (request: Request, response: Response) => {
    const data = await this.agentService.createSkill(actor(request), bodyAs<CreateAgentSkillPayload>(request));
    response.status(201).json({ data, requestId: request.requestId });
  };

  updateSkill = async (request: Request, response: Response) => {
    const data = await this.agentService.updateSkill(actor(request), idParam(request), bodyAs<UpdateAgentSkillPayload>(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  listAvailability = async (request: Request, response: Response) => {
    const data = await this.agentService.listAvailability(actor(request), organizationIdFromQuery(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  upsertAvailability = async (request: Request, response: Response) => {
    const data = await this.agentService.upsertAvailability(actor(request), bodyAs<UpsertAgentAvailabilityPayload>(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  listPerformance = async (request: Request, response: Response) => {
    const data = await this.agentService.listPerformance(actor(request), organizationIdFromQuery(request));
    response.status(200).json({ data, requestId: request.requestId });
  };

  testAgent = async (request: Request, response: Response) => {
    const data = await this.agentService.testAgent(actor(request), bodyAs<TestAgentPayload>(request));
    response.status(201).json({ data, requestId: request.requestId });
  };
}

function actor(request: Request) {
  if (!request.auth) throw AppError.unauthorized();
  return { userId: request.auth.userId, platformRole: request.auth.platformRole };
}

function bodyAs<T>(request: Request): T {
  return request.validatedBody as T;
}

function idParam(request: Request): string {
  const id = request.params.id;
  if (typeof id !== "string") throw AppError.badRequest("INVALID_ID", "A record id is required");
  return id;
}

function organizationIdFromQuery(request: Request): string {
  return ListAgentsQuerySchema.parse(request.query).organizationId;
}
