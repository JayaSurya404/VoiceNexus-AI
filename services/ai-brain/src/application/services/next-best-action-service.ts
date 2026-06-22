import { randomUUID } from "node:crypto";
import type { AgentRecommendation } from "../../domain/entities/agent-recommendation.js";
import type { NextBestAction } from "../../domain/entities/next-best-action.js";
import type { AgentRecommendationRepository, NextBestActionRepository } from "../coaching-ports.js";

export interface NextBestActionInput {
  organizationId: string;
  coachingSessionId: string;
  agentId: string;
  conversationId?: string;
  transcript: string;
  confidence?: number;
}

export class NextBestActionService {
  constructor(
    private readonly actions: NextBestActionRepository,
    private readonly recommendations: AgentRecommendationRepository
  ) {}

  async recommend(input: NextBestActionInput): Promise<{
    action: NextBestAction;
    recommendation: AgentRecommendation;
  }> {
    const normalized = input.transcript.toLowerCase();
    const confidence = input.confidence ?? 0.78;
    const now = new Date();
    const actionType: NextBestAction["actionType"] = /(meeting|calendar|schedule)/.test(normalized)
      ? "SCHEDULE_MEETING"
      : /(angry|manager|supervisor|complaint)/.test(normalized)
        ? "ESCALATE"
        : /(email|send|information)/.test(normalized)
          ? "SEND_FOLLOW_UP"
          : /(ready|buy|contract|proposal)/.test(normalized)
            ? "CLOSE_OPPORTUNITY"
            : "ASK_QUESTION";
    const actionPayload: NextBestAction = {
      id: randomUUID(),
      organizationId: input.organizationId,
      coachingSessionId: input.coachingSessionId,
      agentId: input.agentId,
      conversationId: input.conversationId ?? null,
      actionType,
      label: this.labelFor(actionType),
      rationale: this.rationaleFor(actionType),
      priority: actionType === "ESCALATE" ? "HIGH" : "MEDIUM",
      completed: false,
      confidence,
      createdAt: now
    };

    const action = await this.actions.create(actionPayload);
    const recommendationPayload: AgentRecommendation = {
      id: randomUUID(),
      organizationId: input.organizationId,
      coachingSessionId: input.coachingSessionId,
      agentId: input.agentId,
      conversationId: input.conversationId ?? null,
      type: actionType,
      title: this.labelFor(actionType),
      description: this.rationaleFor(actionType),
      priority: action.priority,
      used: false,
      confidence,
      createdAt: now
    };

    const recommendation = await this.recommendations.create(recommendationPayload);

    return { action, recommendation };
  }

  listActions(organizationId: string): Promise<NextBestAction[]> {
    return this.actions.listByOrganization(organizationId);
  }

  getAction(organizationId: string, id: string): Promise<NextBestAction | null> {
    return this.actions.findById(organizationId, id);
  }

  listRecommendations(organizationId: string): Promise<AgentRecommendation[]> {
    return this.recommendations.listByOrganization(organizationId);
  }

  getRecommendation(organizationId: string, id: string): Promise<AgentRecommendation | null> {
    return this.recommendations.findById(organizationId, id);
  }

  private labelFor(actionType: NextBestAction["actionType"]): string {
    const labels: Record<NextBestAction["actionType"], string> = {
      ASK_QUESTION: "Ask a discovery question",
      SCHEDULE_MEETING: "Schedule a meeting",
      SEND_FOLLOW_UP: "Send a follow-up",
      ESCALATE: "Escalate the conversation",
      TRANSFER: "Transfer to a specialist",
      CLOSE_OPPORTUNITY: "Close the opportunity"
    };

    return labels[actionType];
  }

  private rationaleFor(actionType: NextBestAction["actionType"]): string {
    const rationales: Record<NextBestAction["actionType"], string> = {
      ASK_QUESTION: "The conversation would benefit from more discovery before proposing a solution.",
      SCHEDULE_MEETING: "The customer signaled scheduling intent, so a booked next step is appropriate.",
      SEND_FOLLOW_UP: "The customer requested information or deferred the decision.",
      ESCALATE: "The conversation contains risk or urgency that should involve a senior owner.",
      TRANSFER: "A specialist can resolve the current topic more quickly.",
      CLOSE_OPPORTUNITY: "The customer shows buying intent and is ready for a concrete close."
    };

    return rationales[actionType];
  }
}
