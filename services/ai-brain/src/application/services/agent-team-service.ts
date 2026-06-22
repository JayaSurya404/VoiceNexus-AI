import type { AgentTeamRepository } from "../ports.js";
import type { AgentTeam } from "../../domain/entities/agent-team.js";

export class AgentTeamService {
  constructor(private readonly teams: AgentTeamRepository) {}

  create(input: Omit<AgentTeam, "id" | "createdAt" | "updatedAt">): Promise<AgentTeam> {
    return this.teams.create(input);
  }

  list(organizationId: string): Promise<AgentTeam[]> {
    return this.teams.listByOrganization(organizationId);
  }

  async get(id: string, organizationId: string): Promise<AgentTeam | null> {
    const team = await this.teams.findById(id);
    return team?.organizationId === organizationId ? team : null;
  }

  update(id: string, organizationId: string, input: Parameters<AgentTeamRepository["update"]>[2]): Promise<AgentTeam | null> {
    return this.teams.update(id, organizationId, input);
  }

  delete(id: string, organizationId: string): Promise<boolean> {
    return this.teams.delete(id, organizationId);
  }
}
