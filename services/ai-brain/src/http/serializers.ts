import type { AgentDecision } from "../domain/entities/agent-decision.js";
import type { AgentPersona } from "../domain/entities/agent-persona.js";
import type { AgentSession } from "../domain/entities/agent-session.js";
import type { AIConversation } from "../domain/entities/ai-conversation.js";
import type { AIMessage } from "../domain/entities/ai-message.js";
import type { ConversationState } from "../domain/entities/conversation-state.js";
import type { LeadQualification } from "../domain/entities/lead-qualification.js";
import type { ToolExecution } from "../domain/entities/tool-execution.js";
import type { ActionAudit } from "../domain/entities/action-audit.js";
import type { ScheduledFollowup } from "../domain/entities/scheduled-followup.js";
import type { WorkflowAction } from "../domain/entities/workflow-action.js";
import type { WorkflowExecution } from "../domain/entities/workflow-execution.js";
import type { Agent } from "../domain/entities/agent.js";
import type { AgentAvailability } from "../domain/entities/agent-availability.js";
import type { HumanAgentSession } from "../domain/entities/human-agent-session.js";
import type { LiveTakeover } from "../domain/entities/live-takeover.js";
import type { SupervisorSession } from "../domain/entities/supervisor-session.js";
import type { WhisperMessage } from "../domain/entities/whisper-message.js";
import type { AgentSkill } from "../domain/entities/agent-skill.js";
import type { Queue } from "../domain/entities/queue.js";
import type { QueueMember } from "../domain/entities/queue-member.js";
import type { QueueSession } from "../domain/entities/queue-session.js";
import type { RoutingDecision } from "../domain/entities/routing-decision.js";
import type { RoutingRule } from "../domain/entities/routing-rule.js";
import type { AgentPerformance } from "../domain/entities/agent-performance.js";
import type { CallOutcome } from "../domain/entities/call-outcome.js";
import type { ConversationAnalytics } from "../domain/entities/conversation-analytics.js";
import type { QualityScore } from "../domain/entities/quality-score.js";
import type { QueueAnalytics } from "../domain/entities/queue-analytics.js";
import type { SentimentAnalysis } from "../domain/entities/sentiment-analysis.js";
import type { KnowledgeBase } from "../domain/entities/knowledge-base.js";
import type { KnowledgeChunk } from "../domain/entities/knowledge-chunk.js";
import type { KnowledgeCitation } from "../domain/entities/knowledge-citation.js";
import type { KnowledgeDocument } from "../domain/entities/knowledge-document.js";
import type { KnowledgeFeedback } from "../domain/entities/knowledge-feedback.js";
import type { KnowledgeGap } from "../domain/entities/knowledge-gap.js";
import type { KnowledgeImprovement } from "../domain/entities/knowledge-improvement.js";
import type { KnowledgeLearningEvent } from "../domain/entities/knowledge-learning-event.js";
import type { KnowledgeSearch } from "../domain/entities/knowledge-search.js";
import type { KnowledgeSuggestion } from "../domain/entities/knowledge-suggestion.js";
import type { AgentCollaborationDecision } from "../domain/entities/agent-collaboration-decision.js";
import type { AgentCollaborationSession } from "../domain/entities/agent-collaboration-session.js";
import type { AgentDelegation } from "../domain/entities/agent-delegation.js";
import type { AgentTask } from "../domain/entities/agent-task.js";
import type { AgentTeam } from "../domain/entities/agent-team.js";
import type { CrossSellOpportunity } from "../domain/entities/cross-sell-opportunity.js";
import type { DealRisk } from "../domain/entities/deal-risk.js";
import type { Opportunity } from "../domain/entities/opportunity.js";
import type { RevenueForecast } from "../domain/entities/revenue-forecast.js";
import type { SalesInsight } from "../domain/entities/sales-insight.js";
import type { UpsellOpportunity } from "../domain/entities/upsell-opportunity.js";
import type { WinLossAnalysis } from "../domain/entities/win-loss-analysis.js";
import type { BenchmarkMetric } from "../domain/entities/benchmark-metric.js";
import type { BusinessInsight } from "../domain/entities/business-insight.js";
import type { ExecutiveDashboard } from "../domain/entities/executive-dashboard.js";
import type { ExecutiveSummary } from "../domain/entities/executive-summary.js";
import type { GeneratedReport } from "../domain/entities/generated-report.js";
import type { KpiMetric } from "../domain/entities/kpi-metric.js";
import type { ReportExport } from "../domain/entities/report-export.js";
import type { ReportTemplate } from "../domain/entities/report-template.js";
import type { ScheduledReport } from "../domain/entities/scheduled-report.js";
import type { TrendAnalysis } from "../domain/entities/trend-analysis.js";
import type { OptimizationAction } from "../domain/entities/optimization-action.js";
import type { OptimizationEvent } from "../domain/entities/optimization-event.js";
import type { OptimizationExperiment } from "../domain/entities/optimization-experiment.js";
import type { OptimizationGoal } from "../domain/entities/optimization-goal.js";
import type { OptimizationMetric } from "../domain/entities/optimization-metric.js";
import type { OptimizationRecommendation } from "../domain/entities/optimization-recommendation.js";
import type { OptimizationResult } from "../domain/entities/optimization-result.js";
import type { OptimizationRule } from "../domain/entities/optimization-rule.js";
import type { ApiKey } from "../domain/entities/api-key.js";
import type { AuditLog } from "../domain/entities/audit-log.js";
import type { BillingAccount } from "../domain/entities/billing-account.js";
import type { BillingEvent } from "../domain/entities/billing-event.js";
import type { FeatureFlag } from "../domain/entities/feature-flag.js";
import type { Invoice } from "../domain/entities/invoice.js";
import type { Organization } from "../domain/entities/organization.js";
import type { OrganizationSettings } from "../domain/entities/organization-settings.js";
import type { Payment } from "../domain/entities/payment.js";
import type { Subscription } from "../domain/entities/subscription.js";
import type { SubscriptionPlan } from "../domain/entities/subscription-plan.js";
import type { UsageRecord } from "../domain/entities/usage-record.js";
import type { BillingOverview } from "../application/services/billing-service.js";
import type { CreatedApiKey } from "../application/services/api-key-service.js";
import type { TenantAdminOverview } from "../application/ports.js";
import type { AlertEvent, AlertRule } from "../domain/entities/alert.js";
import type { DistributedLock } from "../domain/entities/distributed-lock.js";
import type { ErrorEvent, ErrorFingerprint, ErrorIncident } from "../domain/entities/error-event.js";
import type { HealthCheck } from "../domain/entities/health-check.js";
import type { Metric, MetricSnapshot } from "../domain/entities/metric.js";
import type { CircuitBreaker, FallbackStrategy, RetryPolicy } from "../domain/entities/resilience.js";
import type { EventLog, Span, Trace } from "../domain/entities/trace.js";
import type { HealthStatus, LivenessStatus, ReadinessStatus } from "../application/services/health-check-service.js";
import type { ProductionOverview } from "../application/ports.js";
import type {
  BackupJob,
  BackupSnapshot,
  ConfigurationIssue,
  DeploymentEnvironment,
  DeploymentEvent,
  DeploymentTarget,
  DisasterRecoveryPlan,
  EnvironmentValidation,
  LaunchStatus,
  RecoveryPlan,
  ReleaseChecklist,
  ReleaseReadiness,
  SecurityFinding,
  StartupCheck,
} from "../domain/entities/deployment-readiness.js";
import type { DeploymentReadinessOverview } from "../application/ports.js";

export const toConversationDto = (value: AIConversation) => ({ ...value, startedAt: iso(value.startedAt), endedAt: maybeIso(value.endedAt), createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toMessageDto = (value: AIMessage) => ({ ...value, timestamp: iso(value.timestamp) });
export const toToolExecutionDto = (value: ToolExecution) => ({ ...value, executedAt: iso(value.executedAt) });
export const toQualificationDto = (value: LeadQualification) => ({ ...value, updatedAt: iso(value.updatedAt) });
export const toAgentSessionDto = (value: AgentSession) => ({
  ...value,
  startedAt: iso(value.startedAt),
  endedAt: maybeIso(value.endedAt),
  lastTranscriptAt: maybeIso(value.lastTranscriptAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toAgentPersonaDto = (value: AgentPersona) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toConversationStateDto = (value: ConversationState) => ({ ...value, updatedAt: iso(value.updatedAt) });
export const toAgentDecisionDto = (value: AgentDecision) => ({ ...value, createdAt: iso(value.createdAt) });
export const toWorkflowExecutionDto = (value: WorkflowExecution) => ({
  ...value,
  startedAt: iso(value.startedAt),
  completedAt: maybeIso(value.completedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toWorkflowActionDto = (value: WorkflowAction) => ({
  ...value,
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toScheduledFollowupDto = (value: ScheduledFollowup) => ({
  ...value,
  followupDate: iso(value.followupDate),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
  completedAt: maybeIso(value.completedAt),
});
export const toActionAuditDto = (value: ActionAudit) => ({ ...value, createdAt: iso(value.createdAt) });
export const toHumanAgentDto = (value: Agent) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toAgentAvailabilityDto = (value: AgentAvailability) => ({ ...value, updatedAt: iso(value.updatedAt) });
export const toHumanAgentSessionDto = (value: HumanAgentSession) => ({
  ...value,
  joinedAt: iso(value.joinedAt),
  leftAt: maybeIso(value.leftAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toLiveTakeoverDto = (value: LiveTakeover) => ({
  ...value,
  requestedAt: iso(value.requestedAt),
  approvedAt: maybeIso(value.approvedAt),
  startedAt: maybeIso(value.startedAt),
  endedAt: maybeIso(value.endedAt),
  returnedToAiAt: maybeIso(value.returnedToAiAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toWhisperMessageDto = (value: WhisperMessage) => ({ ...value, createdAt: iso(value.createdAt) });
export const toSupervisorSessionDto = (value: SupervisorSession) => ({
  ...value,
  startedAt: iso(value.startedAt),
  endedAt: maybeIso(value.endedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toQueueDto = (value: Queue) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toQueueMemberDto = (value: QueueMember) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toRoutingRuleDto = (value: RoutingRule) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toRoutingDecisionDto = (value: RoutingDecision) => ({ ...value, createdAt: iso(value.createdAt) });
export const toQueueSessionDto = (value: QueueSession) => ({
  ...value,
  enteredAt: iso(value.enteredAt),
  assignedAt: maybeIso(value.assignedAt),
  completedAt: maybeIso(value.completedAt),
  abandonedAt: maybeIso(value.abandonedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toAgentSkillDto = (value: AgentSkill) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toConversationAnalyticsDto = (value: ConversationAnalytics) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toAgentPerformanceDto = (value: AgentPerformance) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toQueueAnalyticsDto = (value: QueueAnalytics) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toCallOutcomeDto = (value: CallOutcome) => ({
  ...value,
  occurredAt: iso(value.occurredAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toQualityScoreDto = (value: QualityScore) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toSentimentAnalysisDto = (value: SentimentAnalysis) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeBaseDto = (value: KnowledgeBase) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeDocumentDto = (value: KnowledgeDocument) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeChunkDto = (value: KnowledgeChunk) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeSearchDto = (value: KnowledgeSearch) => ({ ...value, createdAt: iso(value.createdAt) });
export const toKnowledgeCitationDto = (value: KnowledgeCitation) => ({ ...value, createdAt: iso(value.createdAt) });
export const toKnowledgeFeedbackDto = (value: KnowledgeFeedback) => ({ ...value, createdAt: iso(value.createdAt) });
export const toKnowledgeGapDto = (value: KnowledgeGap) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toKnowledgeSuggestionDto = (value: KnowledgeSuggestion) => ({
  ...value,
  reviewedAt: maybeIso(value.reviewedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toKnowledgeLearningEventDto = (value: KnowledgeLearningEvent) => ({ ...value, createdAt: iso(value.createdAt) });
export const toKnowledgeImprovementDto = (value: KnowledgeImprovement) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
});
export const toAgentTeamDto = (value: AgentTeam) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toAgentTaskDto = (value: AgentTask) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toAgentDelegationDto = (value: AgentDelegation) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toAgentCollaborationSessionDto = (value: AgentCollaborationSession) => ({
  ...value,
  startedAt: iso(value.startedAt),
  completedAt: maybeIso(value.completedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toAgentCollaborationDecisionDto = (value: AgentCollaborationDecision) => ({ ...value, createdAt: iso(value.createdAt) });
export const toOpportunityDto = (value: Opportunity) => ({
  ...value,
  expectedCloseDate: maybeIso(value.expectedCloseDate),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toRevenueForecastDto = (value: RevenueForecast) => ({
  ...value,
  periodStart: iso(value.periodStart),
  periodEnd: iso(value.periodEnd),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toDealRiskDto = (value: DealRisk) => ({
  ...value,
  detectedAt: iso(value.detectedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toWinLossAnalysisDto = (value: WinLossAnalysis) => ({
  ...value,
  analyzedAt: iso(value.analyzedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toSalesInsightDto = (value: SalesInsight) => ({
  ...value,
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toUpsellOpportunityDto = (value: UpsellOpportunity) => ({
  ...value,
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toCrossSellOpportunityDto = (value: CrossSellOpportunity) => ({
  ...value,
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toReportTemplateDto = (value: ReportTemplate) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toScheduledReportDto = (value: ScheduledReport) => ({
  ...value,
  nextRunAt: iso(value.nextRunAt),
  lastRunAt: maybeIso(value.lastRunAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toGeneratedReportDto = (value: GeneratedReport) => ({
  ...value,
  generatedAt: iso(value.generatedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toExecutiveDashboardDto = (value: ExecutiveDashboard) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toKpiMetricDto = (value: KpiMetric) => ({
  ...value,
  measuredAt: iso(value.measuredAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toTrendAnalysisDto = (value: TrendAnalysis) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toBenchmarkMetricDto = (value: BenchmarkMetric) => ({
  ...value,
  computedAt: iso(value.computedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toBusinessInsightDto = (value: BusinessInsight) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toExecutiveSummaryDto = (value: ExecutiveSummary) => ({
  ...value,
  generatedAt: iso(value.generatedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toReportExportDto = (value: ReportExport) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toOptimizationRuleDto = (value: OptimizationRule) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toOptimizationEventDto = (value: OptimizationEvent) => ({ ...value, createdAt: iso(value.createdAt) });
export const toOptimizationActionDto = (value: OptimizationAction) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toOptimizationRecommendationDto = (value: OptimizationRecommendation) => ({ ...value, createdAt: iso(value.createdAt), updatedAt: iso(value.updatedAt) });
export const toOptimizationMetricDto = (value: OptimizationMetric) => ({
  ...value,
  measuredAt: iso(value.measuredAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toOptimizationGoalDto = (value: OptimizationGoal) => ({
  ...value,
  dueAt: maybeIso(value.dueAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toOptimizationExperimentDto = (value: OptimizationExperiment) => ({
  ...value,
  startedAt: maybeIso(value.startedAt),
  endedAt: maybeIso(value.endedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});
export const toOptimizationResultDto = (value: OptimizationResult) => ({
  ...value,
  capturedAt: iso(value.capturedAt),
  createdAt: iso(value.createdAt),
  updatedAt: iso(value.updatedAt),
});

function iso(date: Date): string {
  return date.toISOString();
}

function maybeIso(date: Date | null): string | null {
  return date ? iso(date) : null;
}
export const toOrganizationDto = (organization: Organization) => ({
  id: organization.id,
  name: organization.name,
  slug: organization.slug,
  status: organization.status,
  ownerUserId: organization.ownerUserId,
  primaryEmail: organization.primaryEmail,
  timezone: organization.timezone,
  metadata: organization.metadata,
  createdAt: organization.createdAt.toISOString(),
  updatedAt: organization.updatedAt.toISOString(),
});

export const toOrganizationSettingsDto = (settings: OrganizationSettings) => ({
  id: settings.id,
  organizationId: settings.organizationId,
  defaultLocale: settings.defaultLocale,
  timezone: settings.timezone,
  dataRetentionDays: settings.dataRetentionDays,
  allowedDomains: settings.allowedDomains,
  security: settings.security,
  notifications: settings.notifications,
  metadata: settings.metadata,
  createdAt: settings.createdAt.toISOString(),
  updatedAt: settings.updatedAt.toISOString(),
});

export const toSubscriptionPlanDto = (plan: SubscriptionPlan) => ({
  id: plan.id,
  organizationId: plan.organizationId,
  tier: plan.tier,
  name: plan.name,
  description: plan.description,
  monthlyPriceCents: plan.monthlyPriceCents,
  limits: plan.limits,
  features: plan.features,
  active: plan.active,
  createdAt: plan.createdAt.toISOString(),
  updatedAt: plan.updatedAt.toISOString(),
});

export const toSubscriptionDto = (subscription: Subscription) => ({
  id: subscription.id,
  organizationId: subscription.organizationId,
  planId: subscription.planId,
  tier: subscription.tier,
  status: subscription.status,
  seats: subscription.seats,
  currentPeriodStart: subscription.currentPeriodStart.toISOString(),
  currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
  entitlements: subscription.entitlements,
  cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  metadata: subscription.metadata,
  createdAt: subscription.createdAt.toISOString(),
  updatedAt: subscription.updatedAt.toISOString(),
});

export const toBillingAccountDto = (account: BillingAccount) => ({
  id: account.id,
  organizationId: account.organizationId,
  billingEmail: account.billingEmail,
  currency: account.currency,
  balanceCents: account.balanceCents,
  creditCents: account.creditCents,
  paymentProvider: account.paymentProvider,
  providerCustomerId: account.providerCustomerId,
  taxId: account.taxId,
  metadata: account.metadata,
  createdAt: account.createdAt.toISOString(),
  updatedAt: account.updatedAt.toISOString(),
});

export const toBillingEventDto = (event: BillingEvent) => ({
  id: event.id,
  organizationId: event.organizationId,
  billingAccountId: event.billingAccountId,
  type: event.type,
  amountCents: event.amountCents,
  currency: event.currency,
  description: event.description,
  metadata: event.metadata,
  createdAt: event.createdAt.toISOString(),
});

export const toInvoiceDto = (invoice: Invoice) => ({
  id: invoice.id,
  organizationId: invoice.organizationId,
  billingAccountId: invoice.billingAccountId,
  invoiceNumber: invoice.invoiceNumber,
  status: invoice.status,
  currency: invoice.currency,
  subtotalCents: invoice.subtotalCents,
  taxCents: invoice.taxCents,
  totalCents: invoice.totalCents,
  balanceDueCents: invoice.balanceDueCents,
  issuedAt: invoice.issuedAt.toISOString(),
  dueAt: invoice.dueAt?.toISOString() ?? null,
  paidAt: invoice.paidAt?.toISOString() ?? null,
  lineItems: invoice.lineItems,
  metadata: invoice.metadata,
  createdAt: invoice.createdAt.toISOString(),
  updatedAt: invoice.updatedAt.toISOString(),
});

export const toPaymentDto = (payment: Payment) => ({
  id: payment.id,
  organizationId: payment.organizationId,
  billingAccountId: payment.billingAccountId,
  invoiceId: payment.invoiceId,
  status: payment.status,
  amountCents: payment.amountCents,
  currency: payment.currency,
  provider: payment.provider,
  providerPaymentId: payment.providerPaymentId,
  failureReason: payment.failureReason,
  paidAt: payment.paidAt?.toISOString() ?? null,
  metadata: payment.metadata,
  createdAt: payment.createdAt.toISOString(),
  updatedAt: payment.updatedAt.toISOString(),
});

export const toApiKeyDto = (apiKey: ApiKey) => ({
  id: apiKey.id,
  organizationId: apiKey.organizationId,
  name: apiKey.name,
  type: apiKey.type,
  keyPrefix: apiKey.keyPrefix,
  scopes: apiKey.scopes,
  lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
  expiresAt: apiKey.expiresAt?.toISOString() ?? null,
  revokedAt: apiKey.revokedAt?.toISOString() ?? null,
  createdBy: apiKey.createdBy,
  metadata: apiKey.metadata,
  createdAt: apiKey.createdAt.toISOString(),
  updatedAt: apiKey.updatedAt.toISOString(),
});

export const toCreatedApiKeyDto = (created: CreatedApiKey) => ({
  apiKey: toApiKeyDto(created.apiKey),
  secret: created.secret,
});

export const toAuditLogDto = (log: AuditLog) => ({
  id: log.id,
  organizationId: log.organizationId,
  actorId: log.actorId,
  actorType: log.actorType,
  action: log.action,
  resourceType: log.resourceType,
  resourceId: log.resourceId,
  ipAddress: log.ipAddress,
  userAgent: log.userAgent,
  metadata: log.metadata,
  createdAt: log.createdAt.toISOString(),
});

export const toFeatureFlagDto = (flag: FeatureFlag) => ({
  id: flag.id,
  organizationId: flag.organizationId,
  key: flag.key,
  enabled: flag.enabled,
  rolloutPercentage: flag.rolloutPercentage,
  metadata: flag.metadata,
  createdAt: flag.createdAt.toISOString(),
  updatedAt: flag.updatedAt.toISOString(),
});

export const toUsageRecordDto = (record: UsageRecord) => ({
  id: record.id,
  organizationId: record.organizationId,
  metric: record.metric,
  quantity: record.quantity,
  unit: record.unit,
  source: record.source,
  occurredAt: record.occurredAt.toISOString(),
  metadata: record.metadata,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

export const toBillingOverviewDto = (overview: BillingOverview) => ({
  account: overview.account ? toBillingAccountDto(overview.account) : null,
  balanceCents: overview.balanceCents,
  creditCents: overview.creditCents,
  invoiceTotalCents: overview.invoiceTotalCents,
  paymentTotalCents: overview.paymentTotalCents,
  recentEvents: overview.recentEvents.map(toBillingEventDto),
});

export const toTenantAdminOverviewDto = (overview: TenantAdminOverview) => ({
  organizationCount: overview.organizationCount,
  activeOrganizationCount: overview.activeOrganizationCount,
  suspendedOrganizationCount: overview.suspendedOrganizationCount,
  activeSubscriptionCount: overview.activeSubscriptionCount,
  monthlyRecurringRevenueCents: overview.monthlyRecurringRevenueCents,
  outstandingBalanceCents: overview.outstandingBalanceCents,
  apiKeyCount: overview.apiKeyCount,
  auditLogCount: overview.auditLogCount,
  usageTotals: overview.usageTotals,
});

export const toHealthCheckDto = (check: HealthCheck) => ({
  ...check,
  checkedAt: check.checkedAt.toISOString(),
  createdAt: check.createdAt.toISOString(),
  updatedAt: check.updatedAt.toISOString(),
});

export const toHealthStatusDto = (status: HealthStatus) => ({
  status: status.status,
  service: status.service,
  startupComplete: status.startupComplete,
  checks: status.checks.map(toHealthCheckDto),
  checkedAt: status.checkedAt.toISOString(),
});

export const toReadinessStatusDto = (status: ReadinessStatus) => ({
  status: status.status,
  checks: status.checks.map(toHealthCheckDto),
  checkedAt: status.checkedAt.toISOString(),
});

export const toLivenessStatusDto = (status: LivenessStatus) => ({
  status: status.status,
  uptimeSeconds: status.uptimeSeconds,
  checkedAt: status.checkedAt.toISOString(),
});

export const toMetricDto = (metric: Metric) => ({
  ...metric,
  recordedAt: metric.recordedAt.toISOString(),
  createdAt: metric.createdAt.toISOString(),
  updatedAt: metric.updatedAt.toISOString(),
});

export const toMetricSnapshotDto = (snapshot: MetricSnapshot) => ({
  ...snapshot,
  capturedAt: snapshot.capturedAt.toISOString(),
  createdAt: snapshot.createdAt.toISOString(),
  updatedAt: snapshot.updatedAt.toISOString(),
});

export const toTraceDto = (trace: Trace) => ({
  ...trace,
  startedAt: trace.startedAt.toISOString(),
  endedAt: trace.endedAt?.toISOString() ?? null,
  createdAt: trace.createdAt.toISOString(),
  updatedAt: trace.updatedAt.toISOString(),
});

export const toSpanDto = (span: Span) => ({
  ...span,
  startedAt: span.startedAt.toISOString(),
  endedAt: span.endedAt?.toISOString() ?? null,
  createdAt: span.createdAt.toISOString(),
  updatedAt: span.updatedAt.toISOString(),
});

export const toEventLogDto = (event: EventLog) => ({
  ...event,
  occurredAt: event.occurredAt.toISOString(),
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});

export const toErrorEventDto = (event: ErrorEvent) => ({
  ...event,
  occurredAt: event.occurredAt.toISOString(),
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});

export const toErrorFingerprintDto = (fingerprint: ErrorFingerprint) => ({
  ...fingerprint,
  firstSeenAt: fingerprint.firstSeenAt.toISOString(),
  lastSeenAt: fingerprint.lastSeenAt.toISOString(),
  createdAt: fingerprint.createdAt.toISOString(),
  updatedAt: fingerprint.updatedAt.toISOString(),
});

export const toErrorIncidentDto = (incident: ErrorIncident) => ({
  ...incident,
  firstOccurrenceAt: incident.firstOccurrenceAt.toISOString(),
  lastOccurrenceAt: incident.lastOccurrenceAt.toISOString(),
  createdAt: incident.createdAt.toISOString(),
  updatedAt: incident.updatedAt.toISOString(),
});

export const toRetryPolicyDto = (policy: RetryPolicy) => ({
  ...policy,
  createdAt: policy.createdAt.toISOString(),
  updatedAt: policy.updatedAt.toISOString(),
});

export const toCircuitBreakerDto = (breaker: CircuitBreaker) => ({
  ...breaker,
  openedAt: breaker.openedAt?.toISOString() ?? null,
  lastFailureAt: breaker.lastFailureAt?.toISOString() ?? null,
  createdAt: breaker.createdAt.toISOString(),
  updatedAt: breaker.updatedAt.toISOString(),
});

export const toFallbackStrategyDto = (strategy: FallbackStrategy) => ({
  ...strategy,
  createdAt: strategy.createdAt.toISOString(),
  updatedAt: strategy.updatedAt.toISOString(),
});

export const toDistributedLockDto = (lock: DistributedLock) => ({
  ...lock,
  expiresAt: lock.expiresAt.toISOString(),
  acquiredAt: lock.acquiredAt.toISOString(),
  releasedAt: lock.releasedAt?.toISOString() ?? null,
  createdAt: lock.createdAt.toISOString(),
  updatedAt: lock.updatedAt.toISOString(),
});

export const toAlertRuleDto = (rule: AlertRule) => ({
  ...rule,
  createdAt: rule.createdAt.toISOString(),
  updatedAt: rule.updatedAt.toISOString(),
});

export const toAlertEventDto = (event: AlertEvent) => ({
  ...event,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});

export const toProductionOverviewDto = (overview: ProductionOverview) => ({ ...overview });

export const toDeploymentEnvironmentDto = (value: DeploymentEnvironment) => ({ ...value, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
export const toDeploymentTargetDto = (value: DeploymentTarget) => ({ ...value, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
export const toEnvironmentValidationDto = (value: EnvironmentValidation) => ({
  ...value,
  checkedAt: value.checkedAt.toISOString(),
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const toStartupCheckDto = (value: StartupCheck) => ({
  ...value,
  checkedAt: value.checkedAt.toISOString(),
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const toConfigurationIssueDto = (value: ConfigurationIssue) => ({ ...value, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
export const toSecurityFindingDto = (value: SecurityFinding) => ({ ...value, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
export const toBackupJobDto = (value: BackupJob) => ({
  ...value,
  lastRunAt: value.lastRunAt?.toISOString() ?? null,
  nextRunAt: value.nextRunAt?.toISOString() ?? null,
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const toBackupSnapshotDto = (value: BackupSnapshot) => ({
  ...value,
  capturedAt: value.capturedAt.toISOString(),
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const toRecoveryPlanDto = (value: RecoveryPlan) => ({ ...value, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
export const toDisasterRecoveryPlanDto = (value: DisasterRecoveryPlan) => ({
  ...value,
  lastTestedAt: value.lastTestedAt?.toISOString() ?? null,
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const toReleaseChecklistDto = (value: ReleaseChecklist) => ({
  ...value,
  dueAt: value.dueAt?.toISOString() ?? null,
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const toReleaseReadinessDto = (value: ReleaseReadiness) => ({
  ...value,
  evaluatedAt: value.evaluatedAt.toISOString(),
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const toDeploymentEventDto = (value: DeploymentEvent) => ({
  ...value,
  occurredAt: value.occurredAt.toISOString(),
  createdAt: value.createdAt.toISOString(),
  updatedAt: value.updatedAt.toISOString(),
});
export const toLaunchStatusDto = (value: LaunchStatus) => ({ ...value, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
export const toDeploymentReadinessOverviewDto = (value: DeploymentReadinessOverview) => ({ ...value });
import type {
  CallRuntimeSession,
  RuntimeConversationTurn,
  RuntimeFallbackEvent,
  RuntimeHealthSnapshot,
  RuntimeIncident
} from "../domain/entities/runtime-orchestration.js";

export const toCallRuntimeSessionDto = (session: CallRuntimeSession) => ({
  id: session.id,
  organizationId: session.organizationId,
  conversationId: session.conversationId,
  callSid: session.callSid ?? null,
  direction: session.direction,
  status: session.status,
  provider: session.provider,
  model: session.model,
  startedAt: session.startedAt.toISOString(),
  updatedAt: session.updatedAt.toISOString(),
  completedAt: session.completedAt?.toISOString() ?? null,
  activeAgentId: session.activeAgentId ?? null,
  activeQueueId: session.activeQueueId ?? null,
  escalationId: session.escalationId ?? null,
  metadata: session.metadata
});

export const toRuntimeConversationTurnDto = (turn: RuntimeConversationTurn) => ({
  id: turn.id,
  organizationId: turn.organizationId,
  sessionId: turn.sessionId,
  conversationId: turn.conversationId,
  userMessage: turn.userMessage,
  assistantMessage: turn.assistantMessage,
  provider: turn.provider,
  model: turn.model,
  citations: turn.citations,
  confidence: turn.confidence,
  fallbackUsed: turn.fallbackUsed,
  createdAt: turn.createdAt.toISOString()
});

export const toRuntimeFallbackEventDto = (event: RuntimeFallbackEvent) => ({
  id: event.id,
  organizationId: event.organizationId,
  sessionId: event.sessionId ?? null,
  fromProvider: event.fromProvider,
  toProvider: event.toProvider,
  reason: event.reason,
  recovered: event.recovered,
  createdAt: event.createdAt.toISOString()
});

export const toRuntimeIncidentDto = (incident: RuntimeIncident) => ({
  id: incident.id,
  organizationId: incident.organizationId,
  sessionId: incident.sessionId ?? null,
  severity: incident.severity,
  category: incident.category,
  message: incident.message,
  resolved: incident.resolved,
  createdAt: incident.createdAt.toISOString(),
  resolvedAt: incident.resolvedAt?.toISOString() ?? null
});

export const toRuntimeHealthSnapshotDto = (snapshot: RuntimeHealthSnapshot) => ({
  organizationId: snapshot.organizationId,
  activeSessions: snapshot.activeSessions,
  activeProvider: snapshot.activeProvider ?? null,
  providerStatuses: snapshot.providerStatuses,
  fallbackEvents: snapshot.fallbackEvents.map(toRuntimeFallbackEventDto),
  incidents: snapshot.incidents.map(toRuntimeIncidentDto),
  dependencies: snapshot.dependencies,
  capturedAt: snapshot.capturedAt.toISOString()
});
