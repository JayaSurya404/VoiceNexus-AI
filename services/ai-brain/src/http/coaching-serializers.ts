import type { CoachingEffectivenessMetrics } from "../application/coaching-ports.js";
import type { AgentCoachingInsight } from "../domain/entities/agent-coaching-insight.js";
import type { AgentCoachingSession } from "../domain/entities/agent-coaching-session.js";
import type { AgentRecommendation } from "../domain/entities/agent-recommendation.js";
import type { ComplianceAlert } from "../domain/entities/compliance-alert.js";
import type { ConversationScorecard } from "../domain/entities/conversation-scorecard.js";
import type { NextBestAction } from "../domain/entities/next-best-action.js";

const iso = (value?: Date | null): string | null => (value ? value.toISOString() : null);

export const serializeAgentCoachingSession = (session: AgentCoachingSession) => ({
  id: session.id,
  organizationId: session.organizationId,
  agentId: session.agentId,
  humanSessionId: session.humanSessionId ?? null,
  aiSessionId: session.aiSessionId ?? null,
  callId: session.callId ?? null,
  conversationId: session.conversationId ?? null,
  status: session.status,
  startedAt: session.startedAt.toISOString(),
  endedAt: iso(session.endedAt),
  createdAt: session.createdAt.toISOString(),
  updatedAt: session.updatedAt.toISOString()
});

export const serializeAgentCoachingInsight = (insight: AgentCoachingInsight) => ({
  id: insight.id,
  organizationId: insight.organizationId,
  coachingSessionId: insight.coachingSessionId,
  agentId: insight.agentId,
  conversationId: insight.conversationId ?? null,
  type: insight.type,
  message: insight.message,
  reasoning: insight.reasoning,
  confidence: insight.confidence,
  accepted: insight.accepted,
  createdAt: insight.createdAt.toISOString()
});

export const serializeAgentRecommendation = (recommendation: AgentRecommendation) => ({
  id: recommendation.id,
  organizationId: recommendation.organizationId,
  coachingSessionId: recommendation.coachingSessionId,
  agentId: recommendation.agentId,
  conversationId: recommendation.conversationId ?? null,
  type: recommendation.type,
  title: recommendation.title,
  description: recommendation.description,
  priority: recommendation.priority,
  used: recommendation.used,
  confidence: recommendation.confidence,
  createdAt: recommendation.createdAt.toISOString()
});

export const serializeComplianceAlert = (alert: ComplianceAlert) => ({
  id: alert.id,
  organizationId: alert.organizationId,
  coachingSessionId: alert.coachingSessionId,
  agentId: alert.agentId,
  conversationId: alert.conversationId ?? null,
  type: alert.type,
  severity: alert.severity,
  message: alert.message,
  resolved: alert.resolved,
  createdAt: alert.createdAt.toISOString()
});

export const serializeConversationScorecard = (scorecard: ConversationScorecard) => ({
  id: scorecard.id,
  organizationId: scorecard.organizationId,
  coachingSessionId: scorecard.coachingSessionId,
  agentId: scorecard.agentId,
  conversationId: scorecard.conversationId ?? null,
  discoveryQuality: scorecard.discoveryQuality,
  qualificationQuality: scorecard.qualificationQuality,
  objectionHandlingQuality: scorecard.objectionHandlingQuality,
  complianceScore: scorecard.complianceScore,
  closingEffectiveness: scorecard.closingEffectiveness,
  overallScore: scorecard.overallScore,
  reasoning: scorecard.reasoning,
  createdAt: scorecard.createdAt.toISOString(),
  updatedAt: scorecard.updatedAt.toISOString()
});

export const serializeNextBestAction = (action: NextBestAction) => ({
  id: action.id,
  organizationId: action.organizationId,
  coachingSessionId: action.coachingSessionId,
  agentId: action.agentId,
  conversationId: action.conversationId ?? null,
  actionType: action.actionType,
  label: action.label,
  rationale: action.rationale,
  priority: action.priority,
  completed: action.completed,
  confidence: action.confidence,
  createdAt: action.createdAt.toISOString()
});

export const serializeCoachingEffectivenessMetrics = (metrics: CoachingEffectivenessMetrics) => ({
  coachingAcceptanceRate: metrics.coachingAcceptanceRate,
  recommendationUsage: metrics.recommendationUsage,
  agentImprovementTrend: metrics.agentImprovementTrend,
  coachingEffectiveness: metrics.coachingEffectiveness
});
