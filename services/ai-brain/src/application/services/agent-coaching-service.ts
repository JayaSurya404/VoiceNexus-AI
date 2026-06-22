import { randomUUID } from "node:crypto";
import type { AgentCoachingInsight } from "../../domain/entities/agent-coaching-insight.js";
import type { AgentCoachingSession } from "../../domain/entities/agent-coaching-session.js";
import type { AgentRecommendation } from "../../domain/entities/agent-recommendation.js";
import type { ConversationScorecard } from "../../domain/entities/conversation-scorecard.js";
import type {
  AgentCoachingInsightRepository,
  AgentCoachingSessionRepository,
  CoachingEffectivenessMetrics
} from "../coaching-ports.js";
import { ComplianceMonitorService } from "./compliance-monitor-service.js";
import { ConversationAnalysisService } from "./conversation-analysis-service.js";
import { NextBestActionService } from "./next-best-action-service.js";
import { ObjectionCoachingService } from "./objection-coaching-service.js";
import { ScorecardService } from "./scorecard-service.js";

export interface CoachingAnalysisInput {
  organizationId: string;
  agentId: string;
  humanSessionId?: string;
  aiSessionId?: string;
  callId?: string;
  conversationId?: string;
  transcript: string;
  confidence?: number;
}

export interface CoachingAnalysisResult {
  session: AgentCoachingSession;
  insights: AgentCoachingInsight[];
}

type CoachingSuggestion = Pick<AgentCoachingInsight, "type" | "message" | "reasoning" | "confidence">;

export class AgentCoachingService {
  constructor(
    private readonly sessions: AgentCoachingSessionRepository,
    private readonly insights: AgentCoachingInsightRepository,
    private readonly conversationAnalysis: ConversationAnalysisService,
    private readonly objectionCoaching: ObjectionCoachingService,
    private readonly nextBestActions: NextBestActionService,
    private readonly complianceMonitor: ComplianceMonitorService,
    private readonly scorecards: ScorecardService
  ) {}

  async analyze(input: CoachingAnalysisInput): Promise<CoachingAnalysisResult> {
    const now = new Date();
    const sessionPayload: AgentCoachingSession = {
      id: randomUUID(),
      organizationId: input.organizationId,
      agentId: input.agentId,
      humanSessionId: input.humanSessionId ?? null,
      aiSessionId: input.aiSessionId ?? null,
      callId: input.callId ?? null,
      conversationId: input.conversationId ?? null,
      status: "ACTIVE",
      startedAt: now,
      endedAt: null,
      createdAt: now,
      updatedAt: now
    };

    const session = await this.sessions.create(sessionPayload);
    const analysis = this.conversationAnalysis.analyze(
      input.confidence === undefined
        ? { transcript: input.transcript }
        : { transcript: input.transcript, confidenceScores: [input.confidence] }
    );
    const complianceInput = {
      organizationId: input.organizationId,
      coachingSessionId: session.id,
      agentId: input.agentId,
      transcript: input.transcript
    };
    const alerts = await this.complianceMonitor.monitor(
      input.conversationId ? { ...complianceInput, conversationId: input.conversationId } : complianceInput
    );
    const suggestions: CoachingSuggestion[] = [
      ...this.objectionCoaching.generate(input.transcript),
      {
        type: "DISCOVERY_QUESTION" as const,
        message: "Ask one open-ended question to clarify impact, timeline, and decision criteria.",
        reasoning: "Discovery depth improves qualification accuracy and next-step quality.",
        confidence: 0.76
      },
      {
        type: "CLOSING_SUGGESTION" as const,
        message: "Summarize the customer goal and confirm the next concrete step.",
        reasoning: "The agent should keep momentum and reduce ambiguity.",
        confidence: 0.72
      }
    ];
    const insights = await Promise.all(
      suggestions.map((suggestion: CoachingSuggestion) => {
        const payload: AgentCoachingInsight = {
          id: randomUUID(),
          organizationId: input.organizationId,
          coachingSessionId: session.id,
          agentId: input.agentId,
          conversationId: input.conversationId ?? null,
          type: suggestion.type,
          message: suggestion.message,
          reasoning: suggestion.reasoning,
          confidence: suggestion.confidence,
          accepted: null,
          createdAt: now
        };

        return this.insights.create(payload);
      })
    );

    const nextBestActionInput = {
      organizationId: input.organizationId,
      coachingSessionId: session.id,
      agentId: input.agentId,
      transcript: input.transcript
    };
    await this.nextBestActions.recommend({
      ...nextBestActionInput,
      ...(input.conversationId ? { conversationId: input.conversationId } : {}),
      ...(input.confidence === undefined ? {} : { confidence: input.confidence })
    });

    const scorecardInput = {
      organizationId: input.organizationId,
      coachingSessionId: session.id,
      agentId: input.agentId,
      analysis,
      complianceAlertCount: alerts.length
    };
    await this.scorecards.score(
      input.conversationId ? { ...scorecardInput, conversationId: input.conversationId } : scorecardInput
    );

    return { session, insights };
  }

  listSessions(organizationId: string): Promise<AgentCoachingSession[]> {
    return this.sessions.listByOrganization(organizationId);
  }

  getSession(organizationId: string, id: string): Promise<AgentCoachingSession | null> {
    return this.sessions.findById(organizationId, id);
  }

  listInsights(organizationId: string): Promise<AgentCoachingInsight[]> {
    return this.insights.listByOrganization(organizationId);
  }

  getInsight(organizationId: string, id: string): Promise<AgentCoachingInsight | null> {
    return this.insights.findById(organizationId, id);
  }

  async getEffectivenessMetrics(organizationId: string): Promise<CoachingEffectivenessMetrics> {
    const [insights, recommendations, scorecards] = await Promise.all([
      this.insights.listByOrganization(organizationId),
      this.nextBestActions.listRecommendations(organizationId),
      this.scorecards.list(organizationId)
    ]);
    const acceptedInsights = insights.filter((insight: AgentCoachingInsight) => insight.accepted === true).length;
    const reviewedInsights = insights.filter((insight: AgentCoachingInsight) => insight.accepted !== null).length;
    const usedRecommendations = recommendations.filter((recommendation: AgentRecommendation) => recommendation.used).length;
    const averageScore =
      scorecards.reduce((sum: number, scorecard: ConversationScorecard) => sum + scorecard.overallScore, 0) /
      Math.max(1, scorecards.length);
    const coachingAcceptanceRate = reviewedInsights > 0 ? acceptedInsights / reviewedInsights : 0;
    const recommendationUsage = recommendations.length > 0 ? usedRecommendations / recommendations.length : 0;

    return {
      coachingAcceptanceRate,
      recommendationUsage,
      agentImprovementTrend: averageScore,
      coachingEffectiveness: (coachingAcceptanceRate + recommendationUsage + averageScore / 100) / 3
    };
  }
}
