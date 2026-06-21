import { AgentPersonaService } from "./application/services/agent-persona-service.js";
import { AgentRuntimeService } from "./application/services/agent-runtime-service.js";
import { ActionExecutionService } from "./application/services/action-execution-service.js";
import { AuditService } from "./application/services/audit-service.js";
import { ContextBuilder } from "./application/services/context-builder.js";
import { ConversationStateService } from "./application/services/conversation-state-service.js";
import { ConversationSummaryEngine } from "./application/services/conversation-summary-engine.js";
import { CrmActionService } from "./application/services/crm-action-service.js";
import { FollowupDecisionService } from "./application/services/followup-decision-service.js";
import { FollowupSchedulerService } from "./application/services/followup-scheduler-service.js";
import { HumanHandoffService } from "./application/services/human-handoff-service.js";
import { LeadQualificationRuntime } from "./application/services/lead-qualification-runtime.js";
import { MemoryInjectionService } from "./application/services/memory-injection-service.js";
import { MemoryActionService } from "./application/services/memory-action-service.js";
import { ObjectionHandlerService } from "./application/services/objection-handler-service.js";
import { PromptEngineService } from "./application/services/prompt-engine-service.js";
import { ResponseGenerationService } from "./application/services/response-generation-service.js";
import { TimelineActionService } from "./application/services/timeline-action-service.js";
import { WorkflowEngineService } from "./application/services/workflow-engine-service.js";
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
      organizationAccess,
    },
    services: {
      accessTokenService,
      actionExecution,
      auditService,
      contextBuilder,
      crmActionService,
      followupDecision,
      followupScheduler,
      handoffService,
      memoryActionService,
      memoryInjection,
      objectionHandler,
      personaService,
      promptEngine,
      qualificationRuntime,
      responseGeneration,
      runtime,
      stateService,
      summaryEngine,
      timelineActionService,
      toolRouter,
      transcriptFinalSubscriber,
      workflowEngine,
    },
  };
}
