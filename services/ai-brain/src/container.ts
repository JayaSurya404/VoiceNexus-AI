import { AgentPersonaService } from "./application/services/agent-persona-service.js";
import { AgentAssistService } from "./application/services/agent-assist-service.js";
import { AgentPerformanceService } from "./application/services/agent-performance-service.js";
import { AgentManagementService } from "./application/services/agent-management-service.js";
import { AgentRuntimeService } from "./application/services/agent-runtime-service.js";
import { ActionExecutionService } from "./application/services/action-execution-service.js";
import { AnalyticsEngineService } from "./application/services/analytics-engine-service.js";
import { AuditService } from "./application/services/audit-service.js";
import { CallScoringService } from "./application/services/call-scoring-service.js";
import { ContextBuilder } from "./application/services/context-builder.js";
import { ConversationStateService } from "./application/services/conversation-state-service.js";
import { ConversationSummaryEngine } from "./application/services/conversation-summary-engine.js";
import { ConversionAnalyticsService } from "./application/services/conversion-analytics-service.js";
import { CrmActionService } from "./application/services/crm-action-service.js";
import { FollowupDecisionService } from "./application/services/followup-decision-service.js";
import { FollowupSchedulerService } from "./application/services/followup-scheduler-service.js";
import { HumanHandoffService } from "./application/services/human-handoff-service.js";
import { HumanConsoleEventService } from "./application/services/human-console-event-service.js";
import { LeadQualificationRuntime } from "./application/services/lead-qualification-runtime.js";
import { LiveTakeoverService } from "./application/services/live-takeover-service.js";
import { MemoryInjectionService } from "./application/services/memory-injection-service.js";
import { MemoryActionService } from "./application/services/memory-action-service.js";
import { ObjectionHandlerService } from "./application/services/objection-handler-service.js";
import { PromptEngineService } from "./application/services/prompt-engine-service.js";
import { QualityAssuranceService } from "./application/services/quality-assurance-service.js";
import { QueuePerformanceService } from "./application/services/queue-performance-service.js";
import { ResponseGenerationService } from "./application/services/response-generation-service.js";
import { RoutingEngineService } from "./application/services/routing-engine-service.js";
import { SentimentAnalysisService } from "./application/services/sentiment-analysis-service.js";
import { SupervisorConsoleService } from "./application/services/supervisor-console-service.js";
import { TimelineActionService } from "./application/services/timeline-action-service.js";
import { WhisperService } from "./application/services/whisper-service.js";
import { WorkflowEngineService } from "./application/services/workflow-engine-service.js";
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
import { TranscriptFinalSubscriber } from "./infrastructure/redis/transcript-final-subscriber.js";
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
  const organizationAccess = new MongoOrganizationAccessRepository();

  const provider = new OpenAIProvider({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_MODEL });
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
      organizationAccess,
    },
    services: {
      accessTokenService,
      actionExecution,
      agentAssist,
      agentPerformance,
      agentManagement,
      analyticsEngine,
      auditService,
      callScoring,
      contextBuilder,
      conversionAnalytics,
      crmActionService,
      followupDecision,
      followupScheduler,
      handoffService,
      humanConsoleEvents,
      liveTakeover,
      memoryActionService,
      memoryInjection,
      objectionHandler,
      personaService,
      promptEngine,
      qualityAssurance,
      queuePerformance,
      qualificationRuntime,
      responseGeneration,
      routingEngine,
      sentimentAnalysis,
      supervisorConsole,
      runtime,
      stateService,
      summaryEngine,
      timelineActionService,
      toolRouter,
      whisperService,
      transcriptFinalSubscriber,
      workflowEngine,
      voiceResponseRequests,
    },
  };
}
