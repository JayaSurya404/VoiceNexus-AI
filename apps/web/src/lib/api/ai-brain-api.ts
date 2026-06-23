"use client";

import { useAuthStore } from "@/store/auth-store";

const aiBrainUrl = process.env.NEXT_PUBLIC_AI_BRAIN_URL ?? "http://localhost:4002";

interface ApiResponse<T> {
  data: T;
}

interface ErrorResponse {
  error: { code: string; message: string };
}

export interface AiConversationDto {
  id: string;
  organizationId: string;
  leadId: string | null;
  callId: string | null;
  status: "ACTIVE" | "ENDED" | "FAILED";
  currentIntent: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "MIXED" | "UNKNOWN";
  leadScore: number;
  summary: string | null;
  outcome: string | null;
  nextActions: string[];
  state: { lastResponse: string | null; detectedLanguage: string | null };
  updatedAt: string;
}

export interface AiMessageDto {
  id: string;
  conversationId: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tokens: number;
  timestamp: string;
}

export interface ToolExecutionDto {
  id: string;
  conversationId: string | null;
  agentSessionId: string | null;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  success: boolean;
  error: string | null;
  executedAt: string;
}

export interface LeadQualificationDto {
  id: string;
  organizationId: string;
  leadId: string;
  conversationId: string | null;
  agentSessionId: string | null;
  score: number;
  confidence: number;
  hotScore: number;
  warmScore: number;
  coldScore: number;
  budgetDetected: boolean;
  authorityDetected: boolean;
  needDetected: boolean;
  timelineDetected: boolean;
  interestLevel: "HOT" | "WARM" | "COLD" | "UNKNOWN";
  qualificationReason: string;
  updatedAt: string;
}

export interface AgentPersonaDto {
  id: string;
  organizationId: string;
  name: string;
  role: "SALES_AGENT" | "SUPPORT_AGENT" | "APPOINTMENT_SETTER" | "COLLECTIONS_AGENT";
  systemPrompt: string;
  tone: string;
  goals: string[];
  constraints: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSessionDto {
  id: string;
  organizationId: string;
  agentPersonaId: string;
  leadId: string | null;
  callId: string | null;
  aiConversationId: string | null;
  status: "ACTIVE" | "PAUSED" | "TRANSFERRED" | "COMPLETED" | "FAILED";
  startedAt: string;
  endedAt: string | null;
  lastTranscriptAt: string | null;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationStateDto {
  id: string;
  organizationId: string;
  agentSessionId: string;
  leadId: string | null;
  callId: string | null;
  state: "GREETING" | "DISCOVERY" | "QUALIFICATION" | "OBJECTION" | "PRICING" | "FOLLOWUP" | "TRANSFER" | "COMPLETED";
  previousState: string | null;
  detectedIntent: string;
  detectedLanguage: string | null;
  sentiment: string;
  confidence: number;
  collectedFacts: Record<string, string>;
  transitionReason: string;
  updatedAt: string;
}

export interface AgentDecisionDto {
  id: string;
  organizationId: string;
  agentSessionId: string;
  aiConversationId: string | null;
  type: "STATE_TRANSITION" | "QUALIFICATION" | "OBJECTION" | "FOLLOWUP" | "HANDOFF" | "TOOL_CALL" | "RESPONSE";
  state: string;
  decision: string;
  confidence: number;
  reasoning: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface RuntimeMetricsDto {
  activeSessions: number;
  completedSessions: number;
  handoffDecisions: number;
  averageConfidence: number;
  hotLeads: number;
  actionSuccessRate?: number;
  pendingFollowups?: number;
}

export interface WorkflowExecutionDto {
  id: string;
  organizationId: string;
  agentSessionId: string;
  conversationId: string | null;
  leadId: string | null;
  trigger: "TRANSCRIPT_FINAL" | "MANUAL" | "SYSTEM";
  status: "PLANNED" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL";
  plannedActions: string[];
  completedActions: number;
  failedActions: number;
  reasoning: string;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowActionDto {
  id: string;
  organizationId: string;
  workflowExecutionId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string | null;
  actionType: string;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "SKIPPED";
  reasoning: string;
  confidence: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledFollowupDto {
  id: string;
  organizationId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string;
  assignedTo: string | null;
  followupDate: string;
  reason: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ActionAuditDto {
  id: string;
  organizationId: string;
  sessionId: string | null;
  conversationId: string | null;
  workflowExecutionId: string | null;
  workflowActionId: string | null;
  actionType: string;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  reasoning: string;
  confidence: number;
  createdAt: string;
}

export interface HumanAgentDto {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: "AGENT" | "SUPERVISOR" | "MANAGER";
  status: "AVAILABLE" | "BUSY" | "OFFLINE" | "BREAK";
  activeSessionId: string | null;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentAvailabilityDto {
  id: string;
  organizationId: string;
  agentId: string;
  status: "AVAILABLE" | "BUSY" | "OFFLINE" | "BREAK";
  statusReason: string | null;
  capacity: number;
  activeSessionCount: number;
  updatedAt: string;
}

export interface QueueDto {
  id: string;
  organizationId: string;
  name: string;
  priority: number;
  maxWaitingTime: number;
  overflowQueueId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueueMemberDto {
  id: string;
  organizationId: string;
  queueId: string;
  agentId: string;
  role: "AGENT" | "SUPERVISOR";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSkillDto {
  id: string;
  organizationId: string;
  agentId: string;
  skill: string;
  level: number;
  certified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueueSessionDto {
  id: string;
  organizationId: string;
  queueId: string;
  callId: string | null;
  aiSessionId: string | null;
  leadId: string | null;
  assignedAgentId: string | null;
  priority: number;
  status: "WAITING" | "ASSIGNED" | "TRANSFERRED" | "COMPLETED" | "ABANDONED";
  source: "AI" | "AGENT" | "QUEUE" | "MANUAL";
  routingReason: string | null;
  escalationPath: string[];
  enteredAt: string;
  assignedAt: string | null;
  completedAt: string | null;
  abandonedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoutingDecisionDto {
  id: string;
  organizationId: string;
  queueSessionId: string | null;
  queueId: string | null;
  agentId: string | null;
  escalationQueueId: string | null;
  status: "COMPLETED" | "FAILED";
  reason: string;
  confidence: number;
  inputs: Record<string, unknown>;
  decisionPath: string[];
  createdAt: string;
}

export interface QueueHealthDto {
  queueId: string;
  queueName: string;
  waiting: number;
  assigned: number;
  averageWaitTime: number;
  longestWaitTime: number;
  activeAgents: number;
  priority: number;
}

export interface AnalyticsOverviewDto {
  aiPerformance: number;
  humanPerformance: number;
  queuePerformance: number;
  leadConversionRate: number;
  qualificationAccuracy: number;
  callOutcomeRate: number;
  agentProductivity: number;
  workflowEffectiveness: number;
}

export interface ConversationAnalyticsDto {
  id: string;
  organizationId: string;
  conversationId: string;
  agentSessionId: string | null;
  leadId: string | null;
  callId: string | null;
  aiConfidence: number;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  sentimentScore: number;
  qualityScore: number;
  outcome: CallOutcomeDto["outcome"] | null;
  leadScore: number;
  qualificationLevel: "HOT" | "WARM" | "COLD" | "UNKNOWN";
  workflowSuccessRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentPerformanceDto {
  id: string;
  organizationId: string;
  agentId: string;
  callsHandled: number;
  averageDuration: number;
  averageQaScore: number;
  averageSentiment: number;
  transfers: number;
  conversions: number;
  leadQuality: number;
  computedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueAnalyticsDto {
  id: string;
  organizationId: string;
  queueId: string;
  waitTime: number;
  abandonmentRate: number;
  transferRate: number;
  escalationRate: number;
  resolutionRate: number;
  sessionsHandled: number;
  computedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversionAnalyticsDto {
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  hotConversionRate: number;
  warmConversionRate: number;
  coldConversionRate: number;
  overallConversionRate: number;
}

export interface CallOutcomeDto {
  id: string;
  organizationId: string;
  conversationId: string | null;
  agentSessionId: string | null;
  leadId: string | null;
  callId: string | null;
  outcome: "SALE" | "BOOKED_MEETING" | "FOLLOW_UP" | "TRANSFERRED" | "VOICEMAIL" | "NO_INTEREST" | "FAILED";
  confidence: number;
  reasoning: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SentimentAnalysisDto {
  id: string;
  organizationId: string;
  conversationId: string;
  agentSessionId: string | null;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  score: number;
  confidence: number;
  reasoning: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityScoreDto {
  id: string;
  organizationId: string;
  conversationId: string;
  agentSessionId: string | null;
  greetingQuality: number;
  discoveryQuality: number;
  qualificationQuality: number;
  objectionHandling: number;
  complianceScore: number;
  closingQuality: number;
  overallScore: number;
  reasoning: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocumentDto {
  id: string;
  organizationId: string;
  knowledgeBaseId: string;
  title: string;
  documentType: "PDF" | "DOCX" | "TXT" | "MARKDOWN";
  status: "UPLOADED" | "PARSED" | "CHUNKED" | "EMBEDDED" | "FAILED";
  sourceName: string;
  contentHash: string;
  metadata: Record<string, unknown>;
  error: string | null;
  chunkCount: number;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunkDto {
  id: string;
  organizationId: string;
  knowledgeBaseId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding: number[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSearchDto {
  id: string;
  organizationId: string;
  query: string;
  transcript: string | null;
  crmContext: Record<string, unknown>;
  memoryContext: Record<string, unknown>;
  resultChunkIds: string[];
  confidence: number;
  createdAt: string;
}

export interface KnowledgeCitationDto {
  id: string;
  organizationId: string;
  searchId: string | null;
  conversationId: string | null;
  agentSessionId: string | null;
  documentId: string;
  chunkId: string;
  quote: string;
  relevanceScore: number;
  createdAt: string;
}

export interface KnowledgeDocumentDetailsDto {
  document: KnowledgeDocumentDto;
  chunks: KnowledgeChunkDto[];
}

export interface KnowledgeSearchResultDto {
  chunks: KnowledgeChunkDto[];
  citations: KnowledgeCitationDto[];
  confidence: number;
  contextText: string;
}

export interface KnowledgeFeedbackDto {
  id: string;
  organizationId: string;
  searchId: string | null;
  citationId: string | null;
  conversationId: string | null;
  agentSessionId: string | null;
  chunkId: string | null;
  type: "HELPFUL" | "UNHELPFUL" | "ESCALATED_CALL" | "HUMAN_TAKEOVER" | "LOW_CONFIDENCE_RESPONSE" | "FAILED_SEARCH";
  retrievalUsage: "RETRIEVED" | "USED" | "IGNORED" | "HELPFUL" | "UNHELPFUL";
  rating: number | null;
  comment: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface KnowledgeGapDto {
  id: string;
  organizationId: string;
  topic: string;
  description: string;
  triggerCount: number;
  unansweredCount: number;
  escalationCount: number;
  averageConfidence: number;
  severityScore: number;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
  sourceSearchIds: string[];
  sourceConversationIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSuggestionDto {
  id: string;
  organizationId: string;
  gapId: string | null;
  type: "FAQ_ENTRY" | "SOP_UPDATE" | "KNOWLEDGE_ARTICLE" | "MISSING_DOCUMENTATION";
  title: string;
  content: string;
  rationale: string;
  confidence: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeLearningEventDto {
  id: string;
  organizationId: string;
  sourceConversationId: string | null;
  sourceSessionId: string | null;
  searchId: string | null;
  topic: string;
  confidence: number;
  triggerReason: "LOW_RETRIEVAL_CONFIDENCE" | "FAILED_SEARCH" | "UNHELPFUL_FEEDBACK" | "HELPFUL_FEEDBACK" | "ESCALATION" | "HUMAN_TAKEOVER";
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface KnowledgeImprovementDto {
  id: string;
  organizationId: string;
  knowledgeQualityScore: number;
  coverageScore: number;
  retrievalSuccessRate: number;
  gapSeverityScore: number;
  feedbackCount: number;
  openGapCount: number;
  suggestionCount: number;
  computedAt: string;
  createdAt: string;
}

export type CollaborativeAgentType = "SalesAgent" | "SupportAgent" | "TechnicalAgent" | "SchedulerAgent" | "QAAgent" | "SupervisorAgent";

export interface AgentTeamDto {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  agents: Array<{ agentId: string; type: CollaborativeAgentType; role: string; active: boolean }>;
  objectives: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTaskDto {
  id: string;
  organizationId: string;
  collaborationSessionId: string | null;
  teamId: string | null;
  assignedAgentId: string | null;
  assignedAgentType: CollaborativeAgentType;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentDelegationDto {
  id: string;
  organizationId: string;
  collaborationSessionId: string | null;
  taskId: string;
  sourceAgentId: string | null;
  targetAgentId: string | null;
  task: string;
  status: "REQUESTED" | "ACCEPTED" | "COMPLETED" | "REJECTED" | "FAILED";
  reasoning: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCollaborationSessionDto {
  id: string;
  organizationId: string;
  teamId: string | null;
  conversationId: string | null;
  agentSessionId: string | null;
  primaryAgentId: string | null;
  status: "ACTIVE" | "REVIEW" | "COMPLETED" | "FAILED";
  customerRequest: string;
  finalResponse: string | null;
  averageConfidence: number;
  resolutionQuality: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCollaborationDecisionDto {
  id: string;
  organizationId: string;
  collaborationSessionId: string;
  decisionType: "DELEGATION" | "SPECIALIST_RESULT" | "SUPERVISOR_REVIEW" | "CONFLICT_RESOLUTION" | "FINAL_APPROVAL";
  agentId: string | null;
  reasoning: string;
  confidence: number;
  approved: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CollaborationMetricsDto {
  delegationCount: number;
  collaborationSuccessRate: number;
  averageConfidence: number;
  resolutionQuality: number;
}

export interface CollaborationsDto {
  sessions: AgentCollaborationSessionDto[];
  decisions: AgentCollaborationDecisionDto[];
  metrics: CollaborationMetricsDto;
}

export interface RevenueAnalyticsSummaryDto {
  pipelineValue: number;
  weightedRevenue: number;
  committedRevenue: number;
  projectedRevenue: number;
  openOpportunities: number;
  wonRevenue: number;
  lostRevenue: number;
  averageDealSize: number;
  winRate: number;
  riskValue: number;
  upsellValue: number;
  crossSellValue: number;
  topLeadSource: string | null;
  topOwnerId: string | null;
}

export interface OpportunityDto {
  id: string;
  organizationId: string;
  leadId: string | null;
  crmContactId: string | null;
  crmDealId: string | null;
  name: string;
  value: number;
  probability: number;
  expectedCloseDate: string | null;
  stageId: string | null;
  stageName: string;
  source: string;
  ownerId: string | null;
  aiScore: number;
  status: "OPEN" | "WON" | "LOST";
  createdAt: string;
  updatedAt: string;
}

export interface RevenueForecastDto {
  id: string;
  organizationId: string;
  period: "MONTH" | "QUARTER" | "YEAR";
  periodStart: string;
  periodEnd: string;
  pipelineValue: number;
  weightedRevenue: number;
  committedRevenue: number;
  projectedRevenue: number;
  opportunityCount: number;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealRiskDto {
  id: string;
  organizationId: string;
  opportunityId: string;
  riskType: "STALLED_DEAL" | "LOW_ENGAGEMENT" | "MISSING_FOLLOW_UP" | "DECLINING_SENTIMENT" | "LONG_SALES_CYCLE";
  riskScore: number;
  reasons: string[];
  recommendedActions: string[];
  active: boolean;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WinLossAnalysisDto {
  id: string;
  organizationId: string;
  opportunityId: string;
  outcome: "WIN" | "LOSS";
  reason: string;
  competitors: string[];
  successFactors: string[];
  failureFactors: string[];
  improvementSuggestions: string[];
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesInsightDto {
  id: string;
  organizationId: string;
  type: "PIPELINE_GROWTH" | "RISK_CONCENTRATION" | "TOP_AGENT" | "LEAD_SOURCE" | "UPSELL_TREND" | "REVENUE_DRIVER";
  title: string;
  message: string;
  value: number;
  trend: "UP" | "DOWN" | "FLAT";
  confidence: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UpsellOpportunityDto {
  id: string;
  organizationId: string;
  customerId: string | null;
  opportunityId: string | null;
  product: string;
  estimatedValue: number;
  fitScore: number;
  reasons: string[];
  recommendedActions: string[];
  status: "OPEN" | "ACCEPTED" | "DISMISSED";
  createdAt: string;
  updatedAt: string;
}

export interface CrossSellOpportunityDto {
  id: string;
  organizationId: string;
  customerId: string | null;
  opportunityId: string | null;
  product: string;
  affinityScore: number;
  estimatedValue: number;
  complementaryServices: string[];
  reasons: string[];
  status: "OPEN" | "ACCEPTED" | "DISMISSED";
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplateDto {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  type: "EXECUTIVE" | "KPI" | "TREND" | "BENCHMARK" | "CUSTOM";
  sections: string[];
  filters: Record<string, unknown>;
  active: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledReportDto {
  id: string;
  organizationId: string;
  templateId: string | null;
  name: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
  recipients: string[];
  nextRunAt: string;
  lastRunAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReportDto {
  id: string;
  organizationId: string;
  templateId: string | null;
  scheduledReportId: string | null;
  title: string;
  status: "GENERATED" | "FAILED";
  summary: string;
  data: Record<string, unknown>;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveDashboardDto {
  id: string;
  organizationId: string;
  revenueOverview: Record<string, unknown>;
  salesOverview: Record<string, unknown>;
  coachingOverview: Record<string, unknown>;
  knowledgeOverview: Record<string, unknown>;
  agentOverview: Record<string, unknown>;
  aiPerformanceOverview: Record<string, unknown>;
  computedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface KpiMetricDto {
  id: string;
  organizationId: string;
  category: "REVENUE" | "SALES" | "SUPPORT" | "AI" | "CONVERSION";
  name: string;
  value: number;
  target: number | null;
  unit: string;
  trend: "UP" | "DOWN" | "FLAT";
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
  measuredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrendAnalysisDto {
  id: string;
  organizationId: string;
  metric: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
  values: Array<{ label: string; value: number }>;
  changePercent: number;
  direction: "UP" | "DOWN" | "FLAT";
  insight: string;
  computedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BenchmarkMetricDto {
  id: string;
  organizationId: string;
  scope: "TEAM" | "QUEUE" | "AGENT" | "ORGANIZATION";
  metric: string;
  value: number;
  benchmarkValue: number;
  percentile: number;
  comparison: "ABOVE" | "BELOW" | "AT";
  computedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessInsightDto {
  id: string;
  organizationId: string;
  type: "GROWTH_OPPORTUNITY" | "PERFORMANCE_ANOMALY" | "RISK_INDICATOR" | "OPTIMIZATION_SUGGESTION";
  title: string;
  message: string;
  impactScore: number;
  recommendedActions: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutiveSummaryDto {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  highlights: string[];
  risks: string[];
  recommendations: string[];
  sourceSections: string[];
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExportDto {
  id: string;
  organizationId: string;
  reportId: string | null;
  format: "CSV" | "XLSX" | "PDF";
  status: "PENDING" | "COMPLETED" | "FAILED";
  fileName: string;
  downloadUrl: string | null;
  requestedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationOverviewDto {
  activeRecommendationCount: number;
  pendingActionCount: number;
  breachedMetricCount: number;
  activeGoalCount: number;
  runningExperimentCount: number;
  averageImpact: number;
}

export interface OptimizationRuleDto {
  id: string;
  organizationId: string;
  name: string;
  scope: "QUEUE" | "AGENT" | "WORKFLOW" | "KNOWLEDGE" | "REVENUE" | "COACHING";
  condition: Record<string, unknown>;
  action: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationEventDto {
  id: string;
  organizationId: string;
  type: "KPI_THRESHOLD_BREACHED" | "BOTTLENECK_DETECTED" | "RECOMMENDATION_GENERATED" | "ACTION_CREATED" | "RESULT_CAPTURED";
  source: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface OptimizationActionDto {
  id: string;
  organizationId: string;
  recommendationId: string | null;
  scope: OptimizationRuleDto["scope"];
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "RUNNING" | "COMPLETED" | "FAILED" | "DISMISSED";
  impactScore: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationRecommendationDto {
  id: string;
  organizationId: string;
  type: "QUEUE_BALANCING" | "AGENT_REALLOCATION" | "WORKFLOW_TUNING" | "KNOWLEDGE_IMPROVEMENT" | "REVENUE_RECOVERY" | "COACHING_INTERVENTION" | "SELF_HEALING";
  title: string;
  rationale: string;
  confidence: number;
  expectedImpact: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "ACTIONED" | "DISMISSED";
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationMetricDto {
  id: string;
  organizationId: string;
  name: string;
  scope: OptimizationRuleDto["scope"];
  value: number;
  target: number;
  unit: string;
  status: "HEALTHY" | "WATCH" | "BREACHED";
  measuredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationGoalDto {
  id: string;
  organizationId: string;
  name: string;
  scope: OptimizationRuleDto["scope"];
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  dueAt: string | null;
  status: "ACTIVE" | "ACHIEVED" | "MISSED" | "PAUSED";
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationExperimentDto {
  id: string;
  organizationId: string;
  name: string;
  hypothesis: string;
  scope: OptimizationRuleDto["scope"];
  status: "PLANNED" | "RUNNING" | "COMPLETED" | "FAILED";
  baselineMetric: number;
  targetMetric: number;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationResultDto {
  id: string;
  organizationId: string;
  actionId: string | null;
  experimentId: string | null;
  metric: string;
  beforeValue: number;
  afterValue: number;
  impactPercent: number;
  summary: string;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCoachingSessionDto {
  id: string;
  organizationId: string;
  agentId: string;
  humanSessionId: string | null;
  aiSessionId: string | null;
  callId: string | null;
  conversationId: string | null;
  status: "ACTIVE" | "COMPLETED" | "ESCALATED";
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCoachingInsightDto {
  id: string;
  organizationId: string;
  coachingSessionId: string;
  agentId: string;
  conversationId: string | null;
  type: "OBJECTION_HANDLING" | "DISCOVERY_QUESTION" | "CLOSING_SUGGESTION" | "FOLLOW_UP" | "ESCALATION";
  message: string;
  reasoning: string;
  confidence: number;
  accepted: boolean | null;
  createdAt: string;
}

export interface AgentRecommendationDto {
  id: string;
  organizationId: string;
  coachingSessionId: string;
  agentId: string;
  conversationId: string | null;
  type: "ASK_QUESTION" | "SCHEDULE_MEETING" | "SEND_FOLLOW_UP" | "ESCALATE" | "TRANSFER" | "CLOSE_OPPORTUNITY";
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  used: boolean;
  confidence: number;
  createdAt: string;
}

export interface ComplianceAlertDto {
  id: string;
  organizationId: string;
  coachingSessionId: string;
  agentId: string;
  conversationId: string | null;
  type: "MISSING_DISCLOSURE" | "SCRIPT_VIOLATION" | "COMPLIANCE_RISK" | "ESCALATION_REQUIRED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface ConversationScorecardDto {
  id: string;
  organizationId: string;
  coachingSessionId: string;
  agentId: string;
  conversationId: string | null;
  discoveryQuality: number;
  qualificationQuality: number;
  objectionHandlingQuality: number;
  complianceScore: number;
  closingEffectiveness: number;
  overallScore: number;
  reasoning: string;
  createdAt: string;
  updatedAt: string;
}

export interface NextBestActionDto {
  id: string;
  organizationId: string;
  coachingSessionId: string;
  agentId: string;
  conversationId: string | null;
  actionType: AgentRecommendationDto["type"];
  label: string;
  rationale: string;
  priority: AgentRecommendationDto["priority"];
  completed: boolean;
  confidence: number;
  createdAt: string;
}

export interface CoachingEffectivenessMetricsDto {
  coachingAcceptanceRate: number;
  recommendationUsage: number;
  agentImprovementTrend: number;
  coachingEffectiveness: number;
}

export interface HumanAgentSessionDto {
  id: string;
  organizationId: string;
  agentId: string;
  aiSessionId: string | null;
  callId: string | null;
  leadId: string | null;
  status: "JOINED" | "ACTIVE" | "ENDED";
  controller: "AI" | "HUMAN" | "SUPERVISOR";
  joinedAt: string;
  leftAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiveTakeoverDto {
  id: string;
  organizationId: string;
  sessionId: string;
  agentId: string;
  supervisorId: string | null;
  status: "REQUESTED" | "APPROVED" | "ACTIVE" | "ENDED" | "REJECTED";
  reason: string;
  requestedAt: string;
  approvedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  returnedToAiAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WhisperMessageDto {
  id: string;
  organizationId: string;
  sessionId: string;
  senderId: string;
  senderRole: "SUPERVISOR" | "AGENT";
  target: "AGENT" | "AI";
  targetAgentId: string | null;
  content: string;
  private: true;
  createdAt: string;
}

export interface SupervisorOverviewDto {
  activeCalls: number;
  activeAgents: number;
  activeAiSessions: number;
  activeTakeovers: number;
  averageAiConfidence: number;
  averageWaitTime: number;
  hotQualifications: number;
  queuedSessions: number;
  runningWorkflows: number;
}

export interface AgentAssistSuggestionDto {
  sessionId: string;
  suggestedResponses: string[];
  objectionHints: string[];
  memoryInsights: string[];
  qualificationInsights: string[];
  recommendedNextActions: string[];
}

export class AiBrainClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AiBrainClientError";
  }
}

function query(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${aiBrainUrl}${path}`, { ...init, headers });
  const payload = (await response.json()) as ApiResponse<T> | ErrorResponse;

  if (!response.ok) {
    const error = payload as ErrorResponse;
    throw new AiBrainClientError(response.status, error.error.code, error.error.message);
  }

  return (payload as ApiResponse<T>).data;
}

export const aiBrainApi = {
  listConversations: (organizationId: string) =>
    request<AiConversationDto[]>(`/ai/conversations?${query({ organizationId })}`),
  listMessages: (conversationId: string) =>
    request<AiMessageDto[]>(`/ai/conversations/${encodeURIComponent(conversationId)}/messages`),
  listTools: (conversationId: string) =>
    request<ToolExecutionDto[]>(`/ai/conversations/${encodeURIComponent(conversationId)}/tools`),
  listQualifications: (organizationId: string) =>
    request<LeadQualificationDto[]>(`/ai/qualifications?${query({ organizationId })}`),
  listPersonas: (organizationId: string) => request<AgentPersonaDto[]>(`/ai/personas?${query({ organizationId })}`),
  listSessions: (organizationId: string) => request<AgentSessionDto[]>(`/ai/sessions?${query({ organizationId })}`),
  getSessionState: (sessionId: string) =>
    request<ConversationStateDto | null>(`/ai/sessions/${encodeURIComponent(sessionId)}/state`),
  listSessionDecisions: (sessionId: string) =>
    request<AgentDecisionDto[]>(`/ai/sessions/${encodeURIComponent(sessionId)}/decisions`),
  runtimeMetrics: (organizationId: string) =>
    request<RuntimeMetricsDto>(`/ai/runtime/metrics?${query({ organizationId })}`),
  listWorkflows: (organizationId: string) =>
    request<WorkflowExecutionDto[]>(`/ai/workflows?${query({ organizationId })}`),
  listActions: (organizationId: string) =>
    request<WorkflowActionDto[]>(`/ai/actions?${query({ organizationId })}`),
  listFollowups: (organizationId: string) =>
    request<ScheduledFollowupDto[]>(`/ai/followups?${query({ organizationId })}`),
  completeFollowup: (id: string, organizationId: string) =>
    request<ScheduledFollowupDto>(`/ai/followups/${encodeURIComponent(id)}/complete?${query({ organizationId })}`, {
      method: "POST",
    }),
  listAudits: (organizationId: string) =>
    request<ActionAuditDto[]>(`/ai/audits?${query({ organizationId })}`),
  listHumanAgents: (organizationId: string) => request<HumanAgentDto[]>(`/agents?${query({ organizationId })}`),
  createHumanAgent: (input: Pick<HumanAgentDto, "organizationId" | "name" | "email" | "role" | "skills">) =>
    request<HumanAgentDto>("/agents", { method: "POST", body: JSON.stringify(input) }),
  listAvailability: (organizationId: string) =>
    request<AgentAvailabilityDto[]>(`/agents/availability?${query({ organizationId })}`),
  listQueues: (organizationId: string, agentId?: string) =>
    request<QueueDto[]>(`/queues?${query({ organizationId, agentId })}`),
  listQueueMembers: (organizationId: string, queueId?: string, agentId?: string) =>
    request<QueueMemberDto[]>(`/queues/members?${query({ organizationId, queueId, agentId })}`),
  listAgentSkills: (organizationId: string, agentId?: string) =>
    request<AgentSkillDto[]>(`/skills?${query({ organizationId, agentId })}`),
  listQueueSessions: (organizationId: string, queueId?: string, agentId?: string) =>
    request<QueueSessionDto[]>(`/queue-sessions?${query({ organizationId, queueId, agentId })}`),
  listRoutingDecisions: (organizationId: string) =>
    request<RoutingDecisionDto[]>(`/routing/decisions?${query({ organizationId })}`),
  queueHealth: (organizationId: string) =>
    request<QueueHealthDto[]>(`/supervisor/queue-health?${query({ organizationId })}`),
  analyticsOverview: (organizationId: string) =>
    request<AnalyticsOverviewDto>(`/analytics/overview?${query({ organizationId })}`),
  analyticsConversations: (organizationId: string) =>
    request<ConversationAnalyticsDto[]>(`/analytics/conversations?${query({ organizationId })}`),
  analyticsAgents: (organizationId: string) =>
    request<AgentPerformanceDto[]>(`/analytics/agents?${query({ organizationId })}`),
  analyticsQueues: (organizationId: string) =>
    request<QueueAnalyticsDto[]>(`/analytics/queues?${query({ organizationId })}`),
  analyticsConversions: (organizationId: string) =>
    request<ConversionAnalyticsDto>(`/analytics/conversions?${query({ organizationId })}`),
  analyticsOutcomes: (organizationId: string) =>
    request<CallOutcomeDto[]>(`/analytics/outcomes?${query({ organizationId })}`),
  analyticsSentiment: (organizationId: string) =>
    request<SentimentAnalysisDto[]>(`/analytics/sentiment?${query({ organizationId })}`),
  analyticsQuality: (organizationId: string) =>
    request<QualityScoreDto[]>(`/analytics/quality?${query({ organizationId })}`),
  revenueAnalytics: (organizationId: string) =>
    request<RevenueAnalyticsSummaryDto>(`/analytics/revenue?${query({ organizationId })}`),
  revenueForecasts: (organizationId: string) =>
    request<RevenueForecastDto[]>(`/analytics/revenue/forecast?${query({ organizationId })}`),
  revenueRisks: (organizationId: string) =>
    request<DealRiskDto[]>(`/analytics/revenue/risks?${query({ organizationId })}`),
  revenueOpportunities: (organizationId: string) =>
    request<OpportunityDto[]>(`/analytics/revenue/opportunities?${query({ organizationId })}`),
  revenueWinLoss: (organizationId: string) =>
    request<WinLossAnalysisDto[]>(`/analytics/revenue/win-loss?${query({ organizationId })}`),
  revenueInsights: (organizationId: string) =>
    request<SalesInsightDto[]>(`/analytics/revenue/insights?${query({ organizationId })}`),
  revenueUpsell: (organizationId: string) =>
    request<UpsellOpportunityDto[]>(`/analytics/revenue/upsell?${query({ organizationId })}`),
  revenueCrossSell: (organizationId: string) =>
    request<CrossSellOpportunityDto[]>(`/analytics/revenue/cross-sell?${query({ organizationId })}`),
  reportingDashboard: (organizationId: string) =>
    request<ExecutiveDashboardDto>(`/reports/dashboard?${query({ organizationId })}`),
  reportingKpis: (organizationId: string) =>
    request<KpiMetricDto[]>(`/reports/kpis?${query({ organizationId })}`),
  reportingTrends: (organizationId: string) =>
    request<TrendAnalysisDto[]>(`/reports/trends?${query({ organizationId })}`),
  reportingBenchmarks: (organizationId: string) =>
    request<BenchmarkMetricDto[]>(`/reports/benchmarks?${query({ organizationId })}`),
  reportingInsights: (organizationId: string) =>
    request<BusinessInsightDto[]>(`/reports/insights?${query({ organizationId })}`),
  reportingSummaries: (organizationId: string) =>
    request<ExecutiveSummaryDto[]>(`/reports/summaries?${query({ organizationId })}`),
  reportingTemplates: (organizationId: string) =>
    request<ReportTemplateDto[]>(`/reports/templates?${query({ organizationId })}`),
  reportingGenerated: (organizationId: string) =>
    request<GeneratedReportDto[]>(`/reports/generated?${query({ organizationId })}`),
  reportingExports: (organizationId: string) =>
    request<ReportExportDto[]>(`/reports/exports?${query({ organizationId })}`),
  optimizationOverview: (organizationId: string) =>
    request<OptimizationOverviewDto>(`/optimization/overview?${query({ organizationId })}`),
  optimizationRules: (organizationId: string) =>
    request<OptimizationRuleDto[]>(`/optimization/rules?${query({ organizationId })}`),
  optimizationEvents: (organizationId: string) =>
    request<OptimizationEventDto[]>(`/optimization/events?${query({ organizationId })}`),
  optimizationActions: (organizationId: string) =>
    request<OptimizationActionDto[]>(`/optimization/actions?${query({ organizationId })}`),
  optimizationRecommendations: (organizationId: string) =>
    request<OptimizationRecommendationDto[]>(`/optimization/recommendations?${query({ organizationId })}`),
  optimizationMetrics: (organizationId: string) =>
    request<OptimizationMetricDto[]>(`/optimization/metrics?${query({ organizationId })}`),
  optimizationGoals: (organizationId: string) =>
    request<OptimizationGoalDto[]>(`/optimization/goals?${query({ organizationId })}`),
  optimizationExperiments: (organizationId: string) =>
    request<OptimizationExperimentDto[]>(`/optimization/experiments?${query({ organizationId })}`),
  optimizationResults: (organizationId: string) =>
    request<OptimizationResultDto[]>(`/optimization/results?${query({ organizationId })}`),
  uploadKnowledge: (input: {
    organizationId: string;
    knowledgeBaseId?: string | null;
    title: string;
    sourceName: string;
    documentType: KnowledgeDocumentDto["documentType"];
    content: string;
    encoding?: "text" | "base64";
    uploadedBy?: string | null;
    metadata?: Record<string, unknown>;
  }) => request<KnowledgeDocumentDetailsDto>("/knowledge/upload", { method: "POST", body: JSON.stringify(input) }),
  listKnowledgeDocuments: (organizationId: string) =>
    request<KnowledgeDocumentDto[]>(`/knowledge/documents?${query({ organizationId })}`),
  getKnowledgeDocument: (id: string) =>
    request<KnowledgeDocumentDetailsDto>(`/knowledge/documents/${encodeURIComponent(id)}`),
  deleteKnowledgeDocument: (id: string, organizationId: string) =>
    request<{ deleted: boolean }>(`/knowledge/documents/${encodeURIComponent(id)}?${query({ organizationId })}`, { method: "DELETE" }),
  searchKnowledge: (input: {
    organizationId: string;
    query: string;
    transcript?: string | null;
    crmContext?: Record<string, unknown>;
    memoryContext?: Record<string, unknown>;
    conversationId?: string | null;
    agentSessionId?: string | null;
  }) => request<KnowledgeSearchResultDto>("/knowledge/search", { method: "POST", body: JSON.stringify(input) }),
  listKnowledgeSearches: (organizationId: string) =>
    request<KnowledgeSearchDto[]>(`/knowledge/searches?${query({ organizationId })}`),
  listKnowledgeCitations: (organizationId: string) =>
    request<KnowledgeCitationDto[]>(`/knowledge/citations?${query({ organizationId })}`),
  listKnowledgeFeedback: (organizationId: string) =>
    request<KnowledgeFeedbackDto[]>(`/knowledge/feedback?${query({ organizationId })}`),
  createKnowledgeFeedback: (input: {
    organizationId: string;
    searchId?: string | null;
    citationId?: string | null;
    conversationId?: string | null;
    agentSessionId?: string | null;
    chunkId?: string | null;
    type: KnowledgeFeedbackDto["type"];
    retrievalUsage: KnowledgeFeedbackDto["retrievalUsage"];
    rating?: number | null;
    comment?: string | null;
    createdBy?: string | null;
  }) => request<KnowledgeFeedbackDto>("/knowledge/feedback", { method: "POST", body: JSON.stringify(input) }),
  listKnowledgeGaps: (organizationId: string) =>
    request<KnowledgeGapDto[]>(`/knowledge/gaps?${query({ organizationId })}`),
  listKnowledgeSuggestions: (organizationId: string) =>
    request<KnowledgeSuggestionDto[]>(`/knowledge/suggestions?${query({ organizationId })}`),
  approveKnowledgeSuggestion: (id: string, organizationId: string, reviewedBy?: string | null) =>
    request<KnowledgeSuggestionDto>(`/knowledge/suggestions/${encodeURIComponent(id)}/approve`, {
      method: "POST",
      body: JSON.stringify({ organizationId, reviewedBy }),
    }),
  rejectKnowledgeSuggestion: (id: string, organizationId: string, reviewedBy?: string | null) =>
    request<KnowledgeSuggestionDto>(`/knowledge/suggestions/${encodeURIComponent(id)}/reject`, {
      method: "POST",
      body: JSON.stringify({ organizationId, reviewedBy }),
    }),
  listKnowledgeLearningEvents: (organizationId: string) =>
    request<KnowledgeLearningEventDto[]>(`/knowledge/learning-events?${query({ organizationId })}`),
  listKnowledgeImprovements: (organizationId: string) =>
    request<KnowledgeImprovementDto[]>(`/knowledge/improvements?${query({ organizationId })}`),
  listAgentTeams: (organizationId: string) =>
    request<AgentTeamDto[]>(`/ai/teams?${query({ organizationId })}`),
  createAgentTeam: (input: Pick<AgentTeamDto, "organizationId" | "name" | "description" | "agents" | "objectives" | "active">) =>
    request<AgentTeamDto>("/ai/teams", { method: "POST", body: JSON.stringify(input) }),
  updateAgentTeam: (id: string, input: Partial<Pick<AgentTeamDto, "organizationId" | "name" | "description" | "agents" | "objectives" | "active">> & { organizationId: string }) =>
    request<AgentTeamDto>(`/ai/teams/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteAgentTeam: (id: string, organizationId: string) =>
    request<{ deleted: boolean }>(`/ai/teams/${encodeURIComponent(id)}?${query({ organizationId })}`, { method: "DELETE" }),
  listAgentTasks: (organizationId: string) =>
    request<AgentTaskDto[]>(`/ai/tasks?${query({ organizationId })}`),
  listAgentDelegations: (organizationId: string) =>
    request<AgentDelegationDto[]>(`/ai/delegations?${query({ organizationId })}`),
  listCollaborations: (organizationId: string) =>
    request<CollaborationsDto>(`/ai/collaborations?${query({ organizationId })}`),
  listCoachingSessions: (organizationId: string) =>
    request<AgentCoachingSessionDto[]>(`/ai/coaching/sessions?${query({ organizationId })}`),
  listCoachingInsights: (organizationId: string) =>
    request<AgentCoachingInsightDto[]>(`/ai/coaching/insights?${query({ organizationId })}`),
  coachingMetrics: (organizationId: string) =>
    request<CoachingEffectivenessMetricsDto>(`/ai/coaching/metrics?${query({ organizationId })}`),
  listAgentRecommendations: (organizationId: string) =>
    request<AgentRecommendationDto[]>(`/ai/recommendations?${query({ organizationId })}`),
  listComplianceAlerts: (organizationId: string) =>
    request<ComplianceAlertDto[]>(`/ai/compliance-alerts?${query({ organizationId })}`),
  listConversationScorecards: (organizationId: string) =>
    request<ConversationScorecardDto[]>(`/ai/scorecards?${query({ organizationId })}`),
  listNextBestActions: (organizationId: string) =>
    request<NextBestActionDto[]>(`/ai/next-best-actions?${query({ organizationId })}`),
  updateAvailability: (
    agentId: string,
    input: { organizationId: string; status: HumanAgentDto["status"]; statusReason?: string | null; capacity?: number },
  ) => request(`/agents/${encodeURIComponent(agentId)}/availability`, { method: "PUT", body: JSON.stringify(input) }),
  joinAgentSession: (
    agentId: string,
    input: { organizationId: string; aiSessionId?: string | null; callId?: string | null; leadId?: string | null },
  ) => request<HumanAgentSessionDto>(`/agents/${encodeURIComponent(agentId)}/sessions`, { method: "POST", body: JSON.stringify(input) }),
  listTakeovers: (organizationId: string) => request<LiveTakeoverDto[]>(`/takeovers?${query({ organizationId })}`),
  createTakeover: (input: { organizationId: string; sessionId: string; agentId: string; supervisorId?: string | null; reason: string }) =>
    request<LiveTakeoverDto>("/takeovers", { method: "POST", body: JSON.stringify(input) }),
  startTakeover: (id: string) => request<LiveTakeoverDto>(`/takeovers/${encodeURIComponent(id)}/start`, { method: "POST" }),
  endTakeover: (id: string) => request<LiveTakeoverDto>(`/takeovers/${encodeURIComponent(id)}/end`, { method: "POST" }),
  listWhispers: (organizationId: string) => request<WhisperMessageDto[]>(`/whispers?${query({ organizationId })}`),
  createWhisper: (input: {
    organizationId: string;
    sessionId: string;
    senderId: string;
    senderRole: "SUPERVISOR" | "AGENT";
    target: "AGENT" | "AI";
    targetAgentId?: string | null;
    content: string;
  }) => request<WhisperMessageDto>("/whispers", { method: "POST", body: JSON.stringify(input) }),
  supervisorOverview: (organizationId: string) =>
    request<SupervisorOverviewDto>(`/supervisor/overview?${query({ organizationId })}`),
  supervisorSessions: (organizationId: string) =>
    request<HumanAgentSessionDto[]>(`/supervisor/sessions?${query({ organizationId })}`),
  agentAssist: (sessionId: string) => request<AgentAssistSuggestionDto | null>(`/assist/${encodeURIComponent(sessionId)}`),
};
