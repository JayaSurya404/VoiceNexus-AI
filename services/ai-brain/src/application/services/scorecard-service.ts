import { randomUUID } from "node:crypto";
import type { ConversationScorecard } from "../../domain/entities/conversation-scorecard.js";
import type { ConversationScorecardRepository } from "../coaching-ports.js";
import type { ConversationAnalysis } from "./conversation-analysis-service.js";

export interface ScorecardInput {
  organizationId: string;
  coachingSessionId: string;
  agentId: string;
  conversationId?: string;
  analysis: ConversationAnalysis;
  complianceAlertCount: number;
}

export class ScorecardService {
  constructor(private readonly scorecards: ConversationScorecardRepository) {}

  async score(input: ScorecardInput): Promise<ConversationScorecard> {
    const complianceScore = Math.max(0, 100 - input.complianceAlertCount * 18);
    const discoveryQuality = this.bound(78 - Math.max(0, input.analysis.talkListenRatio - 1.6) * 12);
    const qualificationQuality = this.bound(74 - input.analysis.topicShifts * 2);
    const objectionHandlingQuality = this.bound(80 - input.analysis.interruptionCount * 6);
    const closingEffectiveness = this.bound(72 - input.analysis.silencePeriods * 4);
    const overallScore = Math.round(
      (discoveryQuality +
        qualificationQuality +
        objectionHandlingQuality +
        complianceScore +
        closingEffectiveness) /
        5
    );
    const now = new Date();
    const payload: ConversationScorecard = {
      id: randomUUID(),
      organizationId: input.organizationId,
      coachingSessionId: input.coachingSessionId,
      agentId: input.agentId,
      conversationId: input.conversationId ?? null,
      discoveryQuality,
      qualificationQuality,
      objectionHandlingQuality,
      complianceScore,
      closingEffectiveness,
      overallScore,
      reasoning: "Score reflects live conversation balance, compliance alerts, topic movement, and interruption indicators.",
      createdAt: now,
      updatedAt: now
    };

    return this.scorecards.create(payload);
  }

  list(organizationId: string): Promise<ConversationScorecard[]> {
    return this.scorecards.listByOrganization(organizationId);
  }

  get(organizationId: string, id: string): Promise<ConversationScorecard | null> {
    return this.scorecards.findById(organizationId, id);
  }

  private bound(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
}
