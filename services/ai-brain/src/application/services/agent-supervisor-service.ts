import type { AgentCollaborationDecisionRepository } from "../ports.js";
import type { AgentTask } from "../../domain/entities/agent-task.js";

export class AgentSupervisorService {
  constructor(private readonly decisions: AgentCollaborationDecisionRepository) {}

  async review(input: {
    organizationId: string;
    collaborationSessionId: string;
    supervisorAgentId: string | null;
    tasks: AgentTask[];
    finalResponse: string;
  }) {
    const averageConfidence = input.tasks.length
      ? input.tasks.reduce((total, task) => total + task.confidence, 0) / input.tasks.length
      : 0.5;
    const completed = input.tasks.filter((task) => task.status === "COMPLETED").length;
    const resolutionQuality = input.tasks.length ? (completed / input.tasks.length) * 100 : 50;
    const approved = averageConfidence >= 0.55 && resolutionQuality >= 50;

    return this.decisions.create({
      organizationId: input.organizationId,
      collaborationSessionId: input.collaborationSessionId,
      decisionType: "SUPERVISOR_REVIEW",
      agentId: input.supervisorAgentId,
      reasoning: approved
        ? "Supervisor agent approved delegated outputs for final response."
        : "Supervisor agent flagged low confidence or incomplete delegated outputs.",
      confidence: averageConfidence,
      approved,
      metadata: { resolutionQuality, finalResponse: input.finalResponse },
      createdAt: new Date(),
    });
  }
}
