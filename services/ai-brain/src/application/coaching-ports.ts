import type { AgentCoachingInsight } from "../domain/entities/agent-coaching-insight.js";
import type { AgentCoachingSession } from "../domain/entities/agent-coaching-session.js";
import type { AgentRecommendation } from "../domain/entities/agent-recommendation.js";
import type { ComplianceAlert } from "../domain/entities/compliance-alert.js";
import type { ConversationScorecard } from "../domain/entities/conversation-scorecard.js";
import type { NextBestAction } from "../domain/entities/next-best-action.js";

export interface AgentCoachingSessionRepository {
  create(session: AgentCoachingSession): Promise<AgentCoachingSession>;
  findById(organizationId: string, id: string): Promise<AgentCoachingSession | null>;
  listByOrganization(organizationId: string): Promise<AgentCoachingSession[]>;
  update(
    organizationId: string,
    id: string,
    patch: Partial<Pick<AgentCoachingSession, "status" | "endedAt">>
  ): Promise<AgentCoachingSession | null>;
}

export interface AgentCoachingInsightRepository {
  create(insight: AgentCoachingInsight): Promise<AgentCoachingInsight>;
  findById(organizationId: string, id: string): Promise<AgentCoachingInsight | null>;
  listByOrganization(organizationId: string): Promise<AgentCoachingInsight[]>;
}

export interface AgentRecommendationRepository {
  create(recommendation: AgentRecommendation): Promise<AgentRecommendation>;
  findById(organizationId: string, id: string): Promise<AgentRecommendation | null>;
  listByOrganization(organizationId: string): Promise<AgentRecommendation[]>;
}

export interface ComplianceAlertRepository {
  create(alert: ComplianceAlert): Promise<ComplianceAlert>;
  findById(organizationId: string, id: string): Promise<ComplianceAlert | null>;
  listByOrganization(organizationId: string): Promise<ComplianceAlert[]>;
}

export interface ConversationScorecardRepository {
  create(scorecard: ConversationScorecard): Promise<ConversationScorecard>;
  findById(organizationId: string, id: string): Promise<ConversationScorecard | null>;
  listByOrganization(organizationId: string): Promise<ConversationScorecard[]>;
}

export interface NextBestActionRepository {
  create(action: NextBestAction): Promise<NextBestAction>;
  findById(organizationId: string, id: string): Promise<NextBestAction | null>;
  listByOrganization(organizationId: string): Promise<NextBestAction[]>;
}

export interface CoachingEffectivenessMetrics {
  coachingAcceptanceRate: number;
  recommendationUsage: number;
  agentImprovementTrend: number;
  coachingEffectiveness: number;
}
