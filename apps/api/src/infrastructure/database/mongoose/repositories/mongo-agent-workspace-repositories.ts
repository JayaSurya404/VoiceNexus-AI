import type {
  AgentAvailabilityWorkspaceRepository,
  AgentPerformanceWorkspaceRepository,
  AgentPersonaWorkspaceRepository,
  AgentSkillWorkspaceRepository,
  AgentWorkspaceRepository,
} from "../../../../application/ports/repositories.js";
import type {
  AgentPersonaWorkspace,
  AgentPersonaWorkspaceUpdate,
  AgentSkillWorkspace,
  AgentSkillWorkspaceUpdate,
  AgentWorkspace,
  AgentWorkspaceUpdate,
  NewAgentAvailabilityWorkspace,
  NewAgentPersonaWorkspace,
  NewAgentSkillWorkspace,
  NewAgentWorkspace,
} from "../../../../domain/entities/agent-workspace.js";
import {
  AgentAvailabilityWorkspaceModel,
  AgentPerformanceWorkspaceModel,
  AgentPersonaWorkspaceModel,
  AgentSkillWorkspaceModel,
  AgentWorkspaceModel,
} from "../models/agent-workspace-models.js";
import {
  mapAgentAvailabilityWorkspace,
  mapAgentPerformanceWorkspace,
  mapAgentPersonaWorkspace,
  mapAgentSkillWorkspace,
  mapAgentWorkspace,
} from "./mappers.js";

export class MongoAgentWorkspaceRepository implements AgentWorkspaceRepository {
  async create(input: NewAgentWorkspace): Promise<AgentWorkspace> {
    const document = await AgentWorkspaceModel.create(input);
    return mapAgentWorkspace(document);
  }

  async listByOrganization(query: { organizationId: string; search?: string; status?: string }): Promise<AgentWorkspace[]> {
    const filter: Record<string, unknown> = { organizationId: query.organizationId };
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { skills: { $regex: query.search, $options: "i" } },
      ];
    }
    const documents = await AgentWorkspaceModel.find(filter).sort({ updatedAt: -1 }).exec();
    return documents.map(mapAgentWorkspace);
  }

  async findByIdForOrganization(id: string, organizationId: string): Promise<AgentWorkspace | null> {
    const document = await AgentWorkspaceModel.findOne({ _id: id, organizationId }).exec();
    return document ? mapAgentWorkspace(document) : null;
  }

  async updateForOrganization(id: string, organizationId: string, input: AgentWorkspaceUpdate): Promise<AgentWorkspace | null> {
    const document = await AgentWorkspaceModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: input },
      { new: true },
    ).exec();
    return document ? mapAgentWorkspace(document) : null;
  }

  async deleteForOrganization(id: string, organizationId: string): Promise<boolean> {
    const result = await AgentWorkspaceModel.deleteOne({ _id: id, organizationId }).exec();
    return result.deletedCount === 1;
  }
}

export class MongoAgentPersonaWorkspaceRepository implements AgentPersonaWorkspaceRepository {
  async create(input: NewAgentPersonaWorkspace): Promise<AgentPersonaWorkspace> {
    const document = await AgentPersonaWorkspaceModel.create(input);
    return mapAgentPersonaWorkspace(document);
  }

  async listByOrganization(organizationId: string): Promise<AgentPersonaWorkspace[]> {
    const documents = await AgentPersonaWorkspaceModel.find({ organizationId }).sort({ isDefault: -1, updatedAt: -1 }).exec();
    return documents.map(mapAgentPersonaWorkspace);
  }

  async findByIdForOrganization(id: string, organizationId: string): Promise<AgentPersonaWorkspace | null> {
    const document = await AgentPersonaWorkspaceModel.findOne({ _id: id, organizationId }).exec();
    return document ? mapAgentPersonaWorkspace(document) : null;
  }

  async updateForOrganization(id: string, organizationId: string, input: AgentPersonaWorkspaceUpdate): Promise<AgentPersonaWorkspace | null> {
    const document = await AgentPersonaWorkspaceModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: input },
      { new: true },
    ).exec();
    return document ? mapAgentPersonaWorkspace(document) : null;
  }

  async deleteForOrganization(id: string, organizationId: string): Promise<boolean> {
    const result = await AgentPersonaWorkspaceModel.deleteOne({ _id: id, organizationId }).exec();
    return result.deletedCount === 1;
  }
}

export class MongoAgentSkillWorkspaceRepository implements AgentSkillWorkspaceRepository {
  async create(input: NewAgentSkillWorkspace): Promise<AgentSkillWorkspace> {
    const document = await AgentSkillWorkspaceModel.findOneAndUpdate(
      { organizationId: input.organizationId, agentId: input.agentId, skill: input.skill.toUpperCase() },
      { $set: { ...input, skill: input.skill.toUpperCase() } },
      { new: true, upsert: true },
    ).exec();
    return mapAgentSkillWorkspace(document);
  }

  async listByOrganization(organizationId: string, agentId?: string): Promise<AgentSkillWorkspace[]> {
    const documents = await AgentSkillWorkspaceModel.find(agentId ? { organizationId, agentId } : { organizationId }).sort({ skill: 1 }).exec();
    return documents.map(mapAgentSkillWorkspace);
  }

  async updateForOrganization(id: string, organizationId: string, input: AgentSkillWorkspaceUpdate): Promise<AgentSkillWorkspace | null> {
    const document = await AgentSkillWorkspaceModel.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: input.skill ? { ...input, skill: input.skill.toUpperCase() } : input },
      { new: true },
    ).exec();
    return document ? mapAgentSkillWorkspace(document) : null;
  }
}

export class MongoAgentAvailabilityWorkspaceRepository implements AgentAvailabilityWorkspaceRepository {
  async listByOrganization(organizationId: string) {
    const documents = await AgentAvailabilityWorkspaceModel.find({ organizationId }).sort({ updatedAt: -1 }).exec();
    return documents.map(mapAgentAvailabilityWorkspace);
  }

  async findByAgent(organizationId: string, agentId: string) {
    const document = await AgentAvailabilityWorkspaceModel.findOne({ organizationId, agentId }).exec();
    return document ? mapAgentAvailabilityWorkspace(document) : null;
  }

  async upsert(input: NewAgentAvailabilityWorkspace) {
    const document = await AgentAvailabilityWorkspaceModel.findOneAndUpdate(
      { organizationId: input.organizationId, agentId: input.agentId },
      { $set: input },
      { new: true, upsert: true },
    ).exec();
    return mapAgentAvailabilityWorkspace(document);
  }
}

export class MongoAgentPerformanceWorkspaceRepository implements AgentPerformanceWorkspaceRepository {
  async listByOrganization(organizationId: string) {
    const documents = await AgentPerformanceWorkspaceModel.find({ organizationId }).sort({ computedAt: -1 }).exec();
    return documents.map(mapAgentPerformanceWorkspace);
  }

  async findByAgent(organizationId: string, agentId: string) {
    const document = await AgentPerformanceWorkspaceModel.findOne({ organizationId, agentId }).exec();
    return document ? mapAgentPerformanceWorkspace(document) : null;
  }
}
