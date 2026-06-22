import type {
  AgentDecisionRepository,
  AgentPerformanceRepository,
  AgentSessionRepository,
  AnalyticsOverview,
  ConversationAnalyticsRepository,
  LeadQualificationRepository,
  QualityScoreRepository,
  QueueAnalyticsRepository,
  SentimentAnalysisRepository,
  WorkflowExecutionRepository,
} from "../ports.js";
import type { AgentSession } from "../../domain/entities/agent-session.js";
import type { AIConversation } from "../../domain/entities/ai-conversation.js";
import type { CallOutcome } from "../../domain/entities/call-outcome.js";
import type { LeadQualification } from "../../domain/entities/lead-qualification.js";
import type { QualityScore } from "../../domain/entities/quality-score.js";
import type { SentimentAnalysis } from "../../domain/entities/sentiment-analysis.js";
import type { AIConversationRepository } from "../ports.js";
import type { AgentPerformanceService } from "./agent-performance-service.js";
import type { CallScoringService } from "./call-scoring-service.js";
import type { ConversionAnalyticsService } from "./conversion-analytics-service.js";
import type { QualityAssuranceService } from "./quality-assurance-service.js";
import type { QueuePerformanceService } from "./queue-performance-service.js";
import type { SentimentAnalysisService } from "./sentiment-analysis-service.js";

export class AnalyticsEngineService {
  constructor(
    private readonly conversations: AIConversationRepository,
    private readonly sessions: AgentSessionRepository,
    private readonly decisions: AgentDecisionRepository,
    private readonly qualifications: LeadQualificationRepository,
    private readonly workflows: WorkflowExecutionRepository,
    private readonly conversationAnalytics: ConversationAnalyticsRepository,
    private readonly agentPerformances: AgentPerformanceRepository,
    private readonly queueAnalytics: QueueAnalyticsRepository,
    private readonly qualityScores: QualityScoreRepository,
    private readonly sentimentAnalyses: SentimentAnalysisRepository,
    private readonly sentimentService: SentimentAnalysisService,
    private readonly qualityService: QualityAssuranceService,
    private readonly callScoringService: CallScoringService,
    private readonly agentPerformanceService: AgentPerformanceService,
    private readonly queuePerformanceService: QueuePerformanceService,
    private readonly conversionAnalyticsService: ConversionAnalyticsService,
  ) {}

  async refreshOrganization(organizationId: string): Promise<void> {
    const [conversations, sessions, decisions, qualifications, workflows] = await Promise.all([
      this.conversations.listByOrganization(organizationId),
      this.sessions.listByOrganization(organizationId),
      this.decisions.listByOrganization(organizationId, 500),
      this.qualifications.listByOrganization(organizationId),
      this.workflows.listByOrganization(organizationId),
    ]);
    const sentiments: SentimentAnalysis[] = [];
    const qualityScores: QualityScore[] = [];
    const outcomes: CallOutcome[] = [];

    for (const conversation of conversations) {
      const session = findSession(conversation, sessions);
      const qualification = findQualification(conversation, session, qualifications);
      const conversationDecisions = decisions.filter((decision) => decision.aiConversationId === conversation.id || decision.agentSessionId === session?.id);
      const sentiment = await this.sentimentService.analyzeConversation(conversation, session?.id ?? null);
      const quality = await this.qualityService.scoreConversation({
        conversation,
        decisions: conversationDecisions,
        qualification,
        agentSessionId: session?.id ?? null,
      });
      const outcome = await this.callScoringService.scoreConversation(conversation, session);
      const relatedWorkflows = workflows.filter(
        (workflow) => workflow.conversationId === conversation.id || workflow.agentSessionId === session?.id,
      );

      sentiments.push(sentiment);
      qualityScores.push(quality);
      outcomes.push(outcome);
      await this.conversationAnalytics.upsert({
        organizationId,
        conversationId: conversation.id,
        agentSessionId: session?.id ?? null,
        leadId: conversation.leadId,
        callId: conversation.callId,
        aiConfidence: session?.confidence ?? 0,
        sentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        qualityScore: quality.overallScore,
        outcome: outcome.outcome,
        leadScore: qualification?.score ?? conversation.leadScore,
        qualificationLevel: qualification?.interestLevel ?? "UNKNOWN",
        workflowSuccessRate: workflowSuccessRate(relatedWorkflows),
      });
    }

    await this.agentPerformanceService.refresh(organizationId, qualityScores, sentiments, outcomes);
    await this.queuePerformanceService.refresh(organizationId);
  }

  async overview(organizationId: string): Promise<AnalyticsOverview> {
    await this.refreshOrganization(organizationId);
    const [conversations, agents, queues, _quality, _sentiments, conversions, workflows] = await Promise.all([
      this.conversationAnalytics.listByOrganization(organizationId),
      this.agentPerformances.listByOrganization(organizationId),
      this.queueAnalytics.listByOrganization(organizationId),
      this.qualityScores.listByOrganization(organizationId),
      this.sentimentAnalyses.listByOrganization(organizationId),
      this.conversionAnalyticsService.summarize(organizationId),
      this.workflows.listByOrganization(organizationId),
    ]);

    return {
      aiPerformance: average(conversations.map((item) => item.aiConfidence)),
      humanPerformance: average(agents.map((item) => item.averageQaScore)) / 100,
      queuePerformance: average(queues.map((item) => item.resolutionRate)),
      leadConversionRate: conversions.overallConversionRate,
      qualificationAccuracy: average(conversations.map((item) => item.qualificationLevel === "UNKNOWN" ? 0 : item.leadScore / 100)),
      callOutcomeRate: ratio(conversations.filter((item) => item.outcome === "SALE" || item.outcome === "BOOKED_MEETING").length, conversations.length),
      agentProductivity: average(agents.map((item) => item.callsHandled)),
      workflowEffectiveness: workflowSuccessRate(workflows),
    };
  }
}

function findSession(conversation: AIConversation, sessions: AgentSession[]): AgentSession | null {
  return sessions.find((session) => session.aiConversationId === conversation.id || session.callId === conversation.callId) ?? null;
}

function findQualification(
  conversation: AIConversation,
  session: AgentSession | null,
  qualifications: LeadQualification[],
): LeadQualification | null {
  return (
    qualifications.find((qualification) => qualification.conversationId === conversation.id) ??
    qualifications.find((qualification) => session?.id && qualification.agentSessionId === session.id) ??
    qualifications.find((qualification) => conversation.leadId && qualification.leadId === conversation.leadId) ??
    null
  );
}

function workflowSuccessRate(workflows: Array<{ status: string; completedActions: number; failedActions: number }>): number {
  if (!workflows.length) return 0;
  const completed = workflows.filter((workflow) => workflow.status === "COMPLETED").length;
  const actionTotal = workflows.reduce((total, workflow) => total + workflow.completedActions + workflow.failedActions, 0);
  const actionSuccess = actionTotal
    ? workflows.reduce((total, workflow) => total + workflow.completedActions, 0) / actionTotal
    : 0;
  return (completed / workflows.length + actionSuccess) / 2;
}

function average(values: number[]): number {
  const filtered = values.filter((value) => Number.isFinite(value));
  return filtered.length ? filtered.reduce((total, value) => total + value, 0) / filtered.length : 0;
}

function ratio(count: number, total: number): number {
  return total ? count / total : 0;
}
