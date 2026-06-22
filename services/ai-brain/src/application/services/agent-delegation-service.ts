import type { AgentCollaborationDecisionRepository, AgentDelegationRepository } from "../ports.js";
import type { AgentDelegation } from "../../domain/entities/agent-delegation.js";

export class AgentDelegationService {
  constructor(
    private readonly delegations: AgentDelegationRepository,
    private readonly decisions: AgentCollaborationDecisionRepository,
  ) {}

  async delegate(input: Omit<AgentDelegation, "id" | "createdAt" | "updatedAt">): Promise<AgentDelegation> {
    const delegation = await this.delegations.create(input);
    if (input.collaborationSessionId) {
      await this.decisions.create({
        organizationId: input.organizationId,
        collaborationSessionId: input.collaborationSessionId,
        decisionType: "DELEGATION",
        agentId: input.sourceAgentId,
        reasoning: input.reasoning,
        confidence: input.confidence,
        approved: input.confidence >= 0.5,
        metadata: { delegationId: delegation.id, targetAgentId: input.targetAgentId, taskId: input.taskId },
        createdAt: new Date(),
      });
    }
    return delegation;
  }

  list(organizationId: string): Promise<AgentDelegation[]> {
    return this.delegations.listByOrganization(organizationId);
  }

  async get(id: string, organizationId: string): Promise<AgentDelegation | null> {
    const delegation = await this.delegations.findById(id);
    return delegation?.organizationId === organizationId ? delegation : null;
  }

  complete(id: string, organizationId: string, reasoning: string, confidence: number): Promise<AgentDelegation | null> {
    return this.delegations.update(id, organizationId, { status: "COMPLETED", reasoning, confidence });
  }
}
