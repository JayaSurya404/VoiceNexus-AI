import { AgentPersonaService } from "./application/services/agent-persona-service.js";
import { ApiKeyService } from "./application/services/api-key-service.js";
import { AgentAssistService } from "./application/services/agent-assist-service.js";
import { AgentCollaborationService } from "./application/services/agent-collaboration-service.js";
import { AgentCoachingService } from "./application/services/agent-coaching-service.js";
import { AgentDelegationService } from "./application/services/agent-delegation-service.js";
import { AgentPerformanceService } from "./application/services/agent-performance-service.js";
import { AgentManagementService } from "./application/services/agent-management-service.js";
import { AgentRuntimeService } from "./application/services/agent-runtime-service.js";
import { AgentSupervisorService } from "./application/services/agent-supervisor-service.js";
import { AgentTaskService } from "./application/services/agent-task-service.js";
import { AgentTeamService } from "./application/services/agent-team-service.js";
import { ActionExecutionService } from "./application/services/action-execution-service.js";
import { AnalyticsEngineService } from "./application/services/analytics-engine-service.js";
import { AgentAllocationService } from "./application/services/agent-allocation-service.js";
import { AuditLogService } from "./application/services/audit-log-service.js";
import { AuditService } from "./application/services/audit-service.js";
import { BenchmarkService } from "./application/services/benchmark-service.js";
import { BillingService } from "./application/services/billing-service.js";
import { BusinessInsightService } from "./application/services/business-insight-service.js";
import { CallScoringService } from "./application/services/call-scoring-service.js";
import { ContextBuilder } from "./application/services/context-builder.js";
import { ConversationStateService } from "./application/services/conversation-state-service.js";
import { ConversationSummaryEngine } from "./application/services/conversation-summary-engine.js";
import { ConversionAnalyticsService } from "./application/services/conversion-analytics-service.js";
import { ComplianceMonitorService } from "./application/services/compliance-monitor-service.js";
import { CrmActionService } from "./application/services/crm-action-service.js";
import { ConversationAnalysisService } from "./application/services/conversation-analysis-service.js";
import { FollowupDecisionService } from "./application/services/followup-decision-service.js";
import { FollowupSchedulerService } from "./application/services/followup-scheduler-service.js";
import { HumanHandoffService } from "./application/services/human-handoff-service.js";
import { HumanConsoleEventService } from "./application/services/human-console-event-service.js";
import { DealRiskService } from "./application/services/deal-risk-service.js";
import { ChunkingService } from "./application/services/chunking-service.js";
import { CitationService } from "./application/services/citation-service.js";
import { DocumentParserService } from "./application/services/document-parser-service.js";
import { EmbeddingService } from "./application/services/embedding-service.js";
import { ExecutiveDashboardService } from "./application/services/executive-dashboard-service.js";
import { ExecutiveSummaryService } from "./application/services/executive-summary-service.js";
import { FeatureFlagService } from "./application/services/feature-flag-service.js";
import { InvoiceService } from "./application/services/invoice-service.js";
import { KnowledgeIngestionService } from "./application/services/knowledge-ingestion-service.js";
import { KnowledgeSearchService } from "./application/services/knowledge-search-service.js";
import { KnowledgeFeedbackService } from "./application/services/knowledge-feedback-service.js";
import { KnowledgeGapAnalysisService } from "./application/services/knowledge-gap-analysis-service.js";
import { KnowledgeImprovementService } from "./application/services/knowledge-improvement-service.js";
import { KnowledgeLearningService } from "./application/services/knowledge-learning-service.js";
import { KnowledgeOptimizationService } from "./application/services/knowledge-optimization-service.js";
import { KnowledgeSuggestionService } from "./application/services/knowledge-suggestion-service.js";
import { KpiReportingService } from "./application/services/kpi-reporting-service.js";
import { LeadQualificationRuntime } from "./application/services/lead-qualification-runtime.js";
import { LiveTakeoverService } from "./application/services/live-takeover-service.js";
import { MemoryInjectionService } from "./application/services/memory-injection-service.js";
import { MemoryActionService } from "./application/services/memory-action-service.js";
import { NextBestActionService } from "./application/services/next-best-action-service.js";
import { ObjectionCoachingService } from "./application/services/objection-coaching-service.js";
import { ObjectionHandlerService } from "./application/services/objection-handler-service.js";
import { OpportunityIntelligenceService } from "./application/services/opportunity-intelligence-service.js";
import { OrganizationService } from "./application/services/organization-service.js";
import { OptimizationActionService } from "./application/services/optimization-action-service.js";
import { OptimizationEngineService } from "./application/services/optimization-engine-service.js";
import { OptimizationMonitorService } from "./application/services/optimization-monitor-service.js";
import { OptimizationRecommendationService } from "./application/services/optimization-recommendation-service.js";
import { OptimizationRuleService } from "./application/services/optimization-rule-service.js";
import { PromptEngineService } from "./application/services/prompt-engine-service.js";
import { PaymentService } from "./application/services/payment-service.js";
import { QualityAssuranceService } from "./application/services/quality-assurance-service.js";
import { QueueOptimizationService } from "./application/services/queue-optimization-service.js";
import { QueuePerformanceService } from "./application/services/queue-performance-service.js";
import { ResponseGenerationService } from "./application/services/response-generation-service.js";
import { RagRuntimeService } from "./application/services/rag-runtime-service.js";
import { ReportBuilderService } from "./application/services/report-builder-service.js";
import { ReportExportService } from "./application/services/report-export-service.js";
import { ReportingAnalyticsService } from "./application/services/reporting-analytics-service.js";
import { RevenueAnalyticsService } from "./application/services/revenue-analytics-service.js";
import { RevenueForecastService } from "./application/services/revenue-forecast-service.js";
import { RevenueOptimizationService } from "./application/services/revenue-optimization-service.js";
import { RoutingEngineService } from "./application/services/routing-engine-service.js";
import { SalesInsightService } from "./application/services/sales-insight-service.js";
import { ScheduledReportService } from "./application/services/scheduled-report-service.js";
import { ScorecardService } from "./application/services/scorecard-service.js";
import { SentimentAnalysisService } from "./application/services/sentiment-analysis-service.js";
import { SupervisorConsoleService } from "./application/services/supervisor-console-service.js";
import { SubscriptionService } from "./application/services/subscription-service.js";
import { TenantGovernanceService } from "./application/services/tenant-governance-service.js";
import { TimelineActionService } from "./application/services/timeline-action-service.js";
import { TrendAnalysisService } from "./application/services/trend-analysis-service.js";
import { UpsellIntelligenceService } from "./application/services/upsell-intelligence-service.js";
import { UsageTrackingService } from "./application/services/usage-tracking-service.js";
import { WhisperService } from "./application/services/whisper-service.js";
import { WinLossService } from "./application/services/win-loss-service.js";
import { WorkflowEngineService } from "./application/services/workflow-engine-service.js";
import { WorkflowOptimizationService } from "./application/services/workflow-optimization-service.js";
import { VoiceResponseRequestService } from "./application/services/voice-response-request-service.js";
import { env } from "./config/env.js";
import {
  MongoAgentDecisionRepository,
  MongoAgentPersonaRepository,
  MongoAgentSessionRepository,
  MongoAIConversationRepository,
  MongoAIMessageRepository,
  MongoConversationStateRepository,
  MongoLeadQualificationRepository,
  MongoToolExecutionRepository,
} from "./infrastructure/database/mongoose/repositories/core-repositories.js";
import { MongoOrganizationAccessRepository } from "./infrastructure/database/mongoose/repositories/mongo-organization-access-repository.js";
import {
  MongoActionAuditRepository,
  MongoExternalActionRepository,
  MongoScheduledFollowupRepository,
  MongoWorkflowActionRepository,
  MongoWorkflowExecutionRepository,
} from "./infrastructure/database/mongoose/repositories/workflow-repositories.js";
import {
  MongoAgentAvailabilityRepository,
  MongoHumanAgentRepository,
  MongoHumanAgentSessionRepository,
  MongoLiveTakeoverRepository,
  MongoSupervisorSessionRepository,
  MongoWhisperMessageRepository,
} from "./infrastructure/database/mongoose/repositories/human-console-repositories.js";
import {
  MongoAgentSkillRepository,
  MongoQueueMemberRepository,
  MongoQueueRepository,
  MongoQueueSessionRepository,
  MongoRoutingDecisionRepository,
  MongoRoutingRuleRepository,
} from "./infrastructure/database/mongoose/repositories/routing-repositories.js";
import {
  MongoAgentPerformanceRepository,
  MongoCallOutcomeRepository,
  MongoConversationAnalyticsRepository,
  MongoQualityScoreRepository,
  MongoQueueAnalyticsRepository,
  MongoSentimentAnalysisRepository,
} from "./infrastructure/database/mongoose/repositories/analytics-repositories.js";
import {
  MongoKnowledgeBaseRepository,
  MongoKnowledgeChunkRepository,
  MongoKnowledgeCitationRepository,
  MongoKnowledgeDocumentRepository,
  MongoKnowledgeSearchRepository,
} from "./infrastructure/database/mongoose/repositories/knowledge-repositories.js";
import {
  MongoKnowledgeFeedbackRepository,
  MongoKnowledgeGapRepository,
  MongoKnowledgeImprovementRepository,
  MongoKnowledgeLearningEventRepository,
  MongoKnowledgeSuggestionRepository,
} from "./infrastructure/database/mongoose/repositories/knowledge-learning-repositories.js";
import {
  MongoAgentCollaborationDecisionRepository,
  MongoAgentCollaborationSessionRepository,
  MongoAgentDelegationRepository,
  MongoAgentTaskRepository,
  MongoAgentTeamRepository,
} from "./infrastructure/database/mongoose/repositories/collaboration-repositories.js";
import {
  MongoAgentCoachingInsightRepository,
  MongoAgentCoachingSessionRepository,
  MongoAgentRecommendationRepository,
  MongoComplianceAlertRepository,
  MongoConversationScorecardRepository,
  MongoNextBestActionRepository,
} from "./infrastructure/database/mongoose/repositories/coaching-repositories.js";
import {
  MongoCrossSellOpportunityRepository,
  MongoDealRiskRepository,
  MongoDealStageRepository,
  MongoOpportunityRepository,
  MongoRevenueForecastRepository,
  MongoSalesInsightRepository,
  MongoUpsellOpportunityRepository,
  MongoWinLossAnalysisRepository,
} from "./infrastructure/database/mongoose/repositories/revenue-repositories.js";
import {
  MongoBenchmarkMetricRepository,
  MongoBusinessInsightRepository,
  MongoExecutiveDashboardRepository,
  MongoExecutiveSummaryRepository,
  MongoGeneratedReportRepository,
  MongoKpiMetricRepository,
  MongoReportExportRepository,
  MongoReportTemplateRepository,
  MongoScheduledReportRepository,
  MongoTrendAnalysisRepository,
} from "./infrastructure/database/mongoose/repositories/reporting-repositories.js";
import {
  MongoApiKeyRepository,
  MongoAuditLogRepository,
  MongoBillingAccountRepository,
  MongoBillingEventRepository,
  MongoFeatureFlagRepository,
  MongoInvoiceRepository,
  MongoOrganizationRepository,
  MongoOrganizationSettingsRepository,
  MongoPaymentRepository,
  MongoSubscriptionPlanRepository,
  MongoSubscriptionRepository,
  MongoUsageRecordRepository,
} from "./infrastructure/database/mongoose/repositories/governance-repositories.js";
import {
  MongoOptimizationActionRepository,
  MongoOptimizationEventRepository,
  MongoOptimizationExperimentRepository,
  MongoOptimizationGoalRepository,
  MongoOptimizationMetricRepository,
  MongoOptimizationRecommendationRepository,
  MongoOptimizationResultRepository,
  MongoOptimizationRuleRepository,
} from "./infrastructure/database/mongoose/repositories/optimization-repositories.js";
import { TranscriptFinalSubscriber } from "./infrastructure/redis/transcript-final-subscriber.js";
import { OpenAIEmbeddingProvider } from "./providers/openai-embedding-provider.js";
import { OpenAIProvider } from "./providers/openai-provider.js";
import { AccessTokenService } from "./security/access-token-service.js";
import { ToolRouter } from "./tools/tool-router.js";

export function createContainer() {
  const conversations = new MongoAIConversationRepository();
  const messages = new MongoAIMessageRepository();
  const toolExecutions = new MongoToolExecutionRepository();
  const qualifications = new MongoLeadQualificationRepository();
  const sessions = new MongoAgentSessionRepository();
  const personas = new MongoAgentPersonaRepository();
  const states = new MongoConversationStateRepository();
  const decisions = new MongoAgentDecisionRepository();
  const workflows = new MongoWorkflowExecutionRepository();
  const workflowActions = new MongoWorkflowActionRepository();
  const followups = new MongoScheduledFollowupRepository();
  const audits = new MongoActionAuditRepository();
  const externalActions = new MongoExternalActionRepository();
  const humanAgents = new MongoHumanAgentRepository();
  const agentAvailability = new MongoAgentAvailabilityRepository();
  const humanAgentSessions = new MongoHumanAgentSessionRepository();
  const liveTakeovers = new MongoLiveTakeoverRepository();
  const whispers = new MongoWhisperMessageRepository();
  const supervisorSessions = new MongoSupervisorSessionRepository();
  const queues = new MongoQueueRepository();
  const queueMembers = new MongoQueueMemberRepository();
  const routingRules = new MongoRoutingRuleRepository();
  const routingDecisions = new MongoRoutingDecisionRepository();
  const queueSessions = new MongoQueueSessionRepository();
  const agentSkills = new MongoAgentSkillRepository();
  const conversationAnalytics = new MongoConversationAnalyticsRepository();
  const agentPerformances = new MongoAgentPerformanceRepository();
  const queueAnalytics = new MongoQueueAnalyticsRepository();
  const callOutcomes = new MongoCallOutcomeRepository();
  const qualityScores = new MongoQualityScoreRepository();
  const sentimentAnalyses = new MongoSentimentAnalysisRepository();
  const knowledgeBases = new MongoKnowledgeBaseRepository();
  const knowledgeDocuments = new MongoKnowledgeDocumentRepository();
  const knowledgeChunks = new MongoKnowledgeChunkRepository();
  const knowledgeSearches = new MongoKnowledgeSearchRepository();
  const knowledgeCitations = new MongoKnowledgeCitationRepository();
  const knowledgeFeedback = new MongoKnowledgeFeedbackRepository();
  const knowledgeGaps = new MongoKnowledgeGapRepository();
  const knowledgeSuggestions = new MongoKnowledgeSuggestionRepository();
  const knowledgeLearningEvents = new MongoKnowledgeLearningEventRepository();
  const knowledgeImprovements = new MongoKnowledgeImprovementRepository();
  const agentTeams = new MongoAgentTeamRepository();
  const agentTasks = new MongoAgentTaskRepository();
  const agentDelegations = new MongoAgentDelegationRepository();
  const agentCollaborationSessions = new MongoAgentCollaborationSessionRepository();
  const agentCollaborationDecisions = new MongoAgentCollaborationDecisionRepository();
  const agentCoachingSessions = new MongoAgentCoachingSessionRepository();
  const agentCoachingInsights = new MongoAgentCoachingInsightRepository();
  const agentRecommendations = new MongoAgentRecommendationRepository();
  const complianceAlerts = new MongoComplianceAlertRepository();
  const conversationScorecards = new MongoConversationScorecardRepository();
  const nextBestActions = new MongoNextBestActionRepository();
  const opportunities = new MongoOpportunityRepository();
  const dealStages = new MongoDealStageRepository();
  const revenueForecasts = new MongoRevenueForecastRepository();
  const dealRisks = new MongoDealRiskRepository();
  const winLossAnalyses = new MongoWinLossAnalysisRepository();
  const salesInsights = new MongoSalesInsightRepository();
  const upsellOpportunities = new MongoUpsellOpportunityRepository();
  const crossSellOpportunities = new MongoCrossSellOpportunityRepository();
  const reportTemplates = new MongoReportTemplateRepository();
  const scheduledReports = new MongoScheduledReportRepository();
  const generatedReports = new MongoGeneratedReportRepository();
  const executiveDashboards = new MongoExecutiveDashboardRepository();
  const kpiMetrics = new MongoKpiMetricRepository();
  const trendAnalyses = new MongoTrendAnalysisRepository();
  const benchmarkMetrics = new MongoBenchmarkMetricRepository();
  const businessInsights = new MongoBusinessInsightRepository();
  const executiveSummaries = new MongoExecutiveSummaryRepository();
  const reportExports = new MongoReportExportRepository();
  const organizations = new MongoOrganizationRepository();
  const organizationSettings = new MongoOrganizationSettingsRepository();
  const subscriptionPlans = new MongoSubscriptionPlanRepository();
  const subscriptions = new MongoSubscriptionRepository();
  const billingAccounts = new MongoBillingAccountRepository();
  const billingEvents = new MongoBillingEventRepository();
  const invoices = new MongoInvoiceRepository();
  const payments = new MongoPaymentRepository();
  const apiKeys = new MongoApiKeyRepository();
  const auditLogs = new MongoAuditLogRepository();
  const featureFlags = new MongoFeatureFlagRepository();
  const usageRecords = new MongoUsageRecordRepository();
  const optimizationRules = new MongoOptimizationRuleRepository();
  const optimizationEvents = new MongoOptimizationEventRepository();
  const optimizationActions = new MongoOptimizationActionRepository();
  const optimizationRecommendations = new MongoOptimizationRecommendationRepository();
  const optimizationMetrics = new MongoOptimizationMetricRepository();
  const optimizationGoals = new MongoOptimizationGoalRepository();
  const optimizationExperiments = new MongoOptimizationExperimentRepository();
  const optimizationResults = new MongoOptimizationResultRepository();
  const organizationAccess = new MongoOrganizationAccessRepository();

  const provider = new OpenAIProvider({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL });
  const embeddingProvider = new OpenAIEmbeddingProvider({ apiKey: env.OPENAI_API_KEY });
  const personaService = new AgentPersonaService(personas);
  const contextBuilder = new ContextBuilder();
  const memoryInjection = new MemoryInjectionService();
  const stateService = new ConversationStateService(states);
  const promptEngine = new PromptEngineService();
  const qualificationRuntime = new LeadQualificationRuntime(provider, qualifications);
  const objectionHandler = new ObjectionHandlerService();
  const followupDecision = new FollowupDecisionService();
  const handoffService = new HumanHandoffService();
  const responseGeneration = new ResponseGenerationService(provider);
  const documentParser = new DocumentParserService();
  const chunking = new ChunkingService();
  const embeddingService = new EmbeddingService(embeddingProvider);
  const knowledgeIngestion = new KnowledgeIngestionService(
    knowledgeBases,
    knowledgeDocuments,
    knowledgeChunks,
    documentParser,
    chunking,
    embeddingService,
  );
  const knowledgeSearch = new KnowledgeSearchService(knowledgeChunks, knowledgeSearches, embeddingService);
  const citationService = new CitationService(knowledgeCitations);
  const knowledgeLearning = new KnowledgeLearningService(knowledgeLearningEvents);
  const knowledgeFeedbackService = new KnowledgeFeedbackService(knowledgeFeedback, knowledgeLearning);
  const knowledgeGapAnalysis = new KnowledgeGapAnalysisService(
    knowledgeGaps,
    knowledgeSearches,
    knowledgeFeedback,
    knowledgeLearningEvents,
  );
  const knowledgeSuggestion = new KnowledgeSuggestionService(knowledgeSuggestions, knowledgeGaps);
  const knowledgeImprovement = new KnowledgeImprovementService(
    knowledgeImprovements,
    knowledgeChunks,
    knowledgeSearches,
    knowledgeFeedback,
    knowledgeGaps,
    knowledgeSuggestions,
  );
  const ragRuntime = new RagRuntimeService(knowledgeSearch, citationService, knowledgeLearning);
  const agentTeamService = new AgentTeamService(agentTeams);
  const agentTaskService = new AgentTaskService(agentTasks);
  const agentDelegationService = new AgentDelegationService(agentDelegations, agentCollaborationDecisions);
  const agentSupervisorService = new AgentSupervisorService(agentCollaborationDecisions);
  const agentCollaborationService = new AgentCollaborationService(
    agentCollaborationSessions,
    agentTeams,
    agentTasks,
    agentCollaborationDecisions,
    agentDelegationService,
    agentSupervisorService,
    ragRuntime,
  );
  const conversationAnalysis = new ConversationAnalysisService();
  const objectionCoaching = new ObjectionCoachingService();
  const nextBestActionService = new NextBestActionService(nextBestActions, agentRecommendations);
  const complianceMonitor = new ComplianceMonitorService(complianceAlerts);
  const scorecardService = new ScorecardService(conversationScorecards);
  const agentCoachingService = new AgentCoachingService(
    agentCoachingSessions,
    agentCoachingInsights,
    conversationAnalysis,
    objectionCoaching,
    nextBestActionService,
    complianceMonitor,
    scorecardService,
  );
  const opportunityIntelligence = new OpportunityIntelligenceService(opportunities, dealStages);
  const revenueForecast = new RevenueForecastService(revenueForecasts, opportunities);
  const dealRisk = new DealRiskService(dealRisks, opportunities);
  const winLoss = new WinLossService(winLossAnalyses, opportunities);
  const upsellIntelligence = new UpsellIntelligenceService(upsellOpportunities, crossSellOpportunities, opportunities);
  const salesInsight = new SalesInsightService(salesInsights, opportunities, dealRisks, upsellOpportunities);
  const revenueAnalytics = new RevenueAnalyticsService(
    opportunities,
    dealRisks,
    upsellOpportunities,
    crossSellOpportunities,
  );
  const humanConsoleEvents = new HumanConsoleEventService();
  const agentManagement = new AgentManagementService(
    humanAgents,
    agentAvailability,
    humanAgentSessions,
    humanConsoleEvents,
  );
  const liveTakeover = new LiveTakeoverService(liveTakeovers, humanAgentSessions, humanConsoleEvents);
  const whisperService = new WhisperService(whispers, humanConsoleEvents);
  const routingEngine = new RoutingEngineService(
    queues,
    queueMembers,
    routingRules,
    routingDecisions,
    queueSessions,
    agentSkills,
    humanAgents,
    agentAvailability,
    humanConsoleEvents,
  );
  const sentimentAnalysis = new SentimentAnalysisService(sentimentAnalyses);
  const qualityAssurance = new QualityAssuranceService(qualityScores);
  const callScoring = new CallScoringService(callOutcomes);
  const agentPerformance = new AgentPerformanceService(
    agentPerformances,
    humanAgents,
    humanAgentSessions,
    queueSessions,
    qualifications,
  );
  const queuePerformance = new QueuePerformanceService(queueAnalytics, queues, queueSessions);
  const conversionAnalytics = new ConversionAnalyticsService(qualifications, callOutcomes);
  const analyticsEngine = new AnalyticsEngineService(
    conversations,
    sessions,
    decisions,
    qualifications,
    workflows,
    conversationAnalytics,
    agentPerformances,
    queueAnalytics,
    qualityScores,
    sentimentAnalyses,
    sentimentAnalysis,
    qualityAssurance,
    callScoring,
    agentPerformance,
    queuePerformance,
    conversionAnalytics,
  );
  const reportingAnalytics = new ReportingAnalyticsService(
    reportTemplates,
    scheduledReports,
    generatedReports,
    kpiMetrics,
    businessInsights,
    reportExports,
  );
  const executiveDashboard = new ExecutiveDashboardService(executiveDashboards, analyticsEngine, revenueAnalytics);
  const kpiReporting = new KpiReportingService(kpiMetrics, analyticsEngine, revenueAnalytics);
  const scheduledReport = new ScheduledReportService(scheduledReports);
  const reportBuilder = new ReportBuilderService(reportTemplates, generatedReports, reportingAnalytics);
  const trendAnalysisService = new TrendAnalysisService(trendAnalyses, revenueAnalytics);
  const benchmarkService = new BenchmarkService(benchmarkMetrics, revenueAnalytics);
  const businessInsight = new BusinessInsightService(businessInsights, revenueAnalytics);
  const executiveSummary = new ExecutiveSummaryService(executiveSummaries, revenueAnalytics);
  const reportExport = new ReportExportService(reportExports);
  const organization = new OrganizationService(organizations, organizationSettings, featureFlags, auditLogs);
  const subscription = new SubscriptionService(subscriptions, subscriptionPlans, auditLogs);
  const billing = new BillingService(billingAccounts, billingEvents, invoices, payments);
  const invoice = new InvoiceService(invoices);
  const payment = new PaymentService(payments);
  const apiKey = new ApiKeyService(apiKeys, auditLogs);
  const auditLog = new AuditLogService(auditLogs);
  const featureFlag = new FeatureFlagService(featureFlags, auditLogs);
  const usageTracking = new UsageTrackingService(usageRecords, auditLogs);
  const tenantGovernance = new TenantGovernanceService(organizations, subscriptions, billingAccounts, apiKeys, usageRecords);
  const optimizationRule = new OptimizationRuleService(optimizationRules);
  const optimizationMonitor = new OptimizationMonitorService(optimizationMetrics, optimizationEvents, revenueAnalytics);
  const optimizationRecommendation = new OptimizationRecommendationService(optimizationRecommendations, optimizationMetrics);
  const optimizationAction = new OptimizationActionService(optimizationActions, optimizationRecommendations, optimizationEvents);
  const queueOptimization = new QueueOptimizationService(optimizationRecommendations);
  const agentAllocation = new AgentAllocationService(optimizationRecommendations);
  const workflowOptimization = new WorkflowOptimizationService(optimizationRecommendations);
  const knowledgeOptimization = new KnowledgeOptimizationService(optimizationRecommendations);
  const revenueOptimization = new RevenueOptimizationService(optimizationRecommendations);
  const optimizationEngine = new OptimizationEngineService(
    optimizationMonitor,
    optimizationRecommendation,
    optimizationAction,
    optimizationRecommendations,
    optimizationActions,
    optimizationMetrics,
    optimizationGoals,
    optimizationExperiments,
    optimizationResults,
  );
  const supervisorConsole = new SupervisorConsoleService(
    humanAgents,
    agentAvailability,
    humanAgentSessions,
    sessions,
    liveTakeovers,
    decisions,
    qualifications,
    workflows,
    routingEngine,
  );
  const agentAssist = new AgentAssistService(sessions, decisions, qualifications, toolExecutions, responseGeneration);
  const summaryEngine = new ConversationSummaryEngine(provider);
  const auditService = new AuditService(audits);
  const crmActionService = new CrmActionService(externalActions);
  const memoryActionService = new MemoryActionService(externalActions);
  const timelineActionService = new TimelineActionService(externalActions);
  const followupScheduler = new FollowupSchedulerService(followups, crmActionService);
  const actionExecution = new ActionExecutionService(
    workflowActions,
    crmActionService,
    memoryActionService,
    timelineActionService,
    followupScheduler,
    auditService,
  );
  const workflowEngine = new WorkflowEngineService(workflows, actionExecution);
  const voiceResponseRequests = new VoiceResponseRequestService();
  const toolRouter = new ToolRouter(toolExecutions);
  const runtime = new AgentRuntimeService(
    sessions,
    conversations,
    messages,
    decisions,
    personaService,
    contextBuilder,
    memoryInjection,
    stateService,
    promptEngine,
    qualificationRuntime,
    objectionHandler,
    followupDecision,
    handoffService,
    responseGeneration,
    summaryEngine,
    toolRouter,
    workflowEngine,
    liveTakeover,
    voiceResponseRequests,
    ragRuntime,
  );
  const transcriptFinalSubscriber = new TranscriptFinalSubscriber(runtime);
  const accessTokenService = new AccessTokenService(organizationAccess);

  return {
    repositories: {
      conversations,
      messages,
      toolExecutions,
      qualifications,
      sessions,
      personas,
      states,
      decisions,
      workflows,
      workflowActions,
      followups,
      audits,
      externalActions,
      humanAgents,
      agentAvailability,
      humanAgentSessions,
      liveTakeovers,
      whispers,
      supervisorSessions,
      queues,
      queueMembers,
      routingRules,
      routingDecisions,
      queueSessions,
      agentSkills,
      conversationAnalytics,
      agentPerformances,
      queueAnalytics,
      callOutcomes,
      qualityScores,
      sentimentAnalyses,
      knowledgeBases,
      knowledgeDocuments,
      knowledgeChunks,
      knowledgeSearches,
      knowledgeCitations,
      knowledgeFeedback,
      knowledgeGaps,
      knowledgeSuggestions,
      knowledgeLearningEvents,
      knowledgeImprovements,
      agentTeams,
      agentTasks,
      agentDelegations,
      agentCollaborationSessions,
      agentCollaborationDecisions,
      agentCoachingSessions,
      agentCoachingInsights,
      agentRecommendations,
      complianceAlerts,
      conversationScorecards,
      nextBestActions,
      opportunities,
      dealStages,
      revenueForecasts,
      dealRisks,
      winLossAnalyses,
      salesInsights,
      upsellOpportunities,
      crossSellOpportunities,
      reportTemplates,
      scheduledReports,
      generatedReports,
      executiveDashboards,
      kpiMetrics,
      trendAnalyses,
      benchmarkMetrics,
      businessInsights,
      executiveSummaries,
      reportExports,
      organizations,
      organizationSettings,
      subscriptionPlans,
      subscriptions,
      billingAccounts,
      billingEvents,
      invoices,
      payments,
      apiKeys,
      auditLogs,
      featureFlags,
      usageRecords,
      optimizationRules,
      optimizationEvents,
      optimizationActions,
      optimizationRecommendations,
      optimizationMetrics,
      optimizationGoals,
      optimizationExperiments,
      optimizationResults,
      organizationAccess,
    },
    services: {
      accessTokenService,
      actionExecution,
      apiKey,
      auditLog,
      billing,
      featureFlag,
      invoice,
      organization,
      payment,
      subscription,
      tenantGovernance,
      usageTracking,
      agentAllocation,
      agentAssist,
      agentCollaborationService,
      agentCoachingService,
      agentDelegationService,
      agentPerformance,
      agentSupervisorService,
      agentTaskService,
      agentTeamService,
      agentManagement,
      analyticsEngine,
      auditService,
      benchmarkService,
      businessInsight,
      callScoring,
      contextBuilder,
      conversionAnalytics,
      complianceMonitor,
      conversationAnalysis,
      dealRisk,
      crmActionService,
      documentParser,
      chunking,
      embeddingService,
      executiveDashboard,
      executiveSummary,
      followupDecision,
      followupScheduler,
      handoffService,
      humanConsoleEvents,
      knowledgeIngestion,
      knowledgeSearch,
      knowledgeFeedbackService,
      knowledgeGapAnalysis,
      knowledgeSuggestion,
      knowledgeLearning,
      knowledgeImprovement,
      kpiReporting,
      citationService,
      ragRuntime,
      liveTakeover,
      memoryActionService,
      memoryInjection,
      nextBestActionService,
      objectionCoaching,
      objectionHandler,
      opportunityIntelligence,
      optimizationAction,
      optimizationEngine,
      optimizationMonitor,
      optimizationRecommendation,
      optimizationRule,
      personaService,
      promptEngine,
      qualityAssurance,
      queueOptimization,
      queuePerformance,
      qualificationRuntime,
      reportBuilder,
      reportExport,
      reportingAnalytics,
      responseGeneration,
      revenueAnalytics,
      revenueForecast,
      revenueOptimization,
      routingEngine,
      salesInsight,
      scheduledReport,
      scorecardService,
      sentimentAnalysis,
      supervisorConsole,
      runtime,
      stateService,
      summaryEngine,
      trendAnalysisService,
      timelineActionService,
      toolRouter,
      workflowOptimization,
      knowledgeOptimization,
      upsellIntelligence,
      whisperService,
      winLoss,
      transcriptFinalSubscriber,
      workflowEngine,
      voiceResponseRequests,
    },
  };
}
