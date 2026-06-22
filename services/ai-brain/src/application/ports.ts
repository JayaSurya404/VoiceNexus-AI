import type { AgentDecision, AgentDecisionType } from "../domain/entities/agent-decision.js";
import type { AgentPersona, AgentPersonaRole } from "../domain/entities/agent-persona.js";
import type { AgentSession, AgentSessionStatus } from "../domain/entities/agent-session.js";
import type { AIConversation } from "../domain/entities/ai-conversation.js";
import type { AIMessage } from "../domain/entities/ai-message.js";
import type { ConversationState, ConversationStateName } from "../domain/entities/conversation-state.js";
import type { LeadQualification } from "../domain/entities/lead-qualification.js";
import type { ToolExecution } from "../domain/entities/tool-execution.js";
import type { ActionAudit } from "../domain/entities/action-audit.js";
import type { ScheduledFollowup } from "../domain/entities/scheduled-followup.js";
import type { WorkflowAction, WorkflowActionType } from "../domain/entities/workflow-action.js";
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

export interface AIConversationRepository {
  create(input: Omit<AIConversation, "id" | "createdAt" | "updatedAt">): Promise<AIConversation>;
  findByCall(organizationId: string, callId: string): Promise<AIConversation | null>;
  findById(id: string): Promise<AIConversation | null>;
  listByOrganization(organizationId: string): Promise<AIConversation[]>;
  update(id: string, input: Partial<AIConversation>): Promise<AIConversation | null>;
}

export interface AIMessageRepository {
  create(input: Omit<AIMessage, "id">): Promise<AIMessage>;
  listByConversation(conversationId: string): Promise<AIMessage[]>;
}

export interface ToolExecutionRepository {
  create(input: Omit<ToolExecution, "id">): Promise<ToolExecution>;
  listByAgentSession(agentSessionId: string): Promise<ToolExecution[]>;
  listByConversation(conversationId: string): Promise<ToolExecution[]>;
}

export interface LeadQualificationRepository {
  findByLead(organizationId: string, leadId: string): Promise<LeadQualification | null>;
  listByOrganization(organizationId: string): Promise<LeadQualification[]>;
  upsert(input: Omit<LeadQualification, "id">): Promise<LeadQualification>;
}

export interface AgentSessionRepository {
  create(input: Omit<AgentSession, "id" | "createdAt" | "updatedAt">): Promise<AgentSession>;
  findByCall(organizationId: string, callId: string): Promise<AgentSession | null>;
  findById(id: string): Promise<AgentSession | null>;
  listByOrganization(organizationId: string): Promise<AgentSession[]>;
  update(id: string, input: Partial<Pick<AgentSession, "status" | "endedAt" | "lastTranscriptAt" | "confidence" | "aiConversationId">>): Promise<AgentSession | null>;
}

export interface AgentPersonaRepository {
  create(input: Omit<AgentPersona, "id" | "createdAt" | "updatedAt">): Promise<AgentPersona>;
  delete(id: string, organizationId: string): Promise<boolean>;
  findById(id: string): Promise<AgentPersona | null>;
  findDefault(organizationId: string): Promise<AgentPersona | null>;
  listByOrganization(organizationId: string): Promise<AgentPersona[]>;
  update(id: string, organizationId: string, input: Partial<Pick<AgentPersona, "name" | "role" | "systemPrompt" | "tone" | "goals" | "constraints" | "isDefault">>): Promise<AgentPersona | null>;
}

export interface ConversationStateRepository {
  findBySession(agentSessionId: string): Promise<ConversationState | null>;
  upsert(input: Omit<ConversationState, "id">): Promise<ConversationState>;
}

export interface AgentDecisionRepository {
  create(input: Omit<AgentDecision, "id">): Promise<AgentDecision>;
  listBySession(agentSessionId: string): Promise<AgentDecision[]>;
  listByOrganization(organizationId: string, limit?: number): Promise<AgentDecision[]>;
}

export interface OrganizationAccessRepository {
  userHasAccess(userId: string, organizationId: string): Promise<boolean>;
}

export interface WorkflowExecutionRepository {
  create(input: Omit<WorkflowExecution, "id" | "createdAt" | "updatedAt">): Promise<WorkflowExecution>;
  findById(id: string): Promise<WorkflowExecution | null>;
  listByOrganization(organizationId: string): Promise<WorkflowExecution[]>;
  update(id: string, input: Partial<Pick<WorkflowExecution, "status" | "completedActions" | "failedActions" | "completedAt">>): Promise<WorkflowExecution | null>;
}

export interface WorkflowActionRepository {
  create(input: Omit<WorkflowAction, "id" | "createdAt" | "updatedAt">): Promise<WorkflowAction>;
  findById(id: string): Promise<WorkflowAction | null>;
  listByOrganization(organizationId: string): Promise<WorkflowAction[]>;
  listByWorkflow(workflowExecutionId: string): Promise<WorkflowAction[]>;
  update(id: string, input: Partial<Pick<WorkflowAction, "status" | "output" | "error">>): Promise<WorkflowAction | null>;
}

export interface ScheduledFollowupRepository {
  create(input: Omit<ScheduledFollowup, "id" | "createdAt" | "updatedAt" | "completedAt">): Promise<ScheduledFollowup>;
  complete(id: string, organizationId: string): Promise<ScheduledFollowup | null>;
  findById(id: string): Promise<ScheduledFollowup | null>;
  listByOrganization(organizationId: string): Promise<ScheduledFollowup[]>;
}

export interface ActionAuditRepository {
  create(input: Omit<ActionAudit, "id">): Promise<ActionAudit>;
  findById(id: string): Promise<ActionAudit | null>;
  listByOrganization(organizationId: string): Promise<ActionAudit[]>;
}

export interface HumanAgentRepository {
  create(input: Omit<Agent, "id" | "createdAt" | "updatedAt">): Promise<Agent>;
  delete(id: string, organizationId: string): Promise<boolean>;
  findById(id: string): Promise<Agent | null>;
  listByOrganization(organizationId: string): Promise<Agent[]>;
  update(id: string, organizationId: string, input: Partial<Pick<Agent, "name" | "email" | "role" | "status" | "activeSessionId" | "skills">>): Promise<Agent | null>;
}

export interface AgentAvailabilityRepository {
  listByOrganization(organizationId: string): Promise<AgentAvailability[]>;
  upsert(input: Omit<AgentAvailability, "id">): Promise<AgentAvailability>;
}

export interface HumanAgentSessionRepository {
  create(input: Omit<HumanAgentSession, "id" | "createdAt" | "updatedAt">): Promise<HumanAgentSession>;
  findById(id: string): Promise<HumanAgentSession | null>;
  listByOrganization(organizationId: string): Promise<HumanAgentSession[]>;
  update(id: string, input: Partial<Pick<HumanAgentSession, "status" | "controller" | "leftAt">>): Promise<HumanAgentSession | null>;
}

export interface LiveTakeoverRepository {
  create(input: Omit<LiveTakeover, "id" | "createdAt" | "updatedAt">): Promise<LiveTakeover>;
  findById(id: string): Promise<LiveTakeover | null>;
  listByOrganization(organizationId: string): Promise<LiveTakeover[]>;
  update(id: string, input: Partial<Pick<LiveTakeover, "status" | "approvedAt" | "startedAt" | "endedAt" | "returnedToAiAt" | "metadata">>): Promise<LiveTakeover | null>;
}

export interface WhisperMessageRepository {
  create(input: Omit<WhisperMessage, "id">): Promise<WhisperMessage>;
  findById(id: string): Promise<WhisperMessage | null>;
  listByOrganization(organizationId: string): Promise<WhisperMessage[]>;
}

export interface SupervisorSessionRepository {
  create(input: Omit<SupervisorSession, "id" | "createdAt" | "updatedAt">): Promise<SupervisorSession>;
  listByOrganization(organizationId: string): Promise<SupervisorSession[]>;
  update(id: string, input: Partial<Pick<SupervisorSession, "status" | "endedAt" | "watchedSessionIds">>): Promise<SupervisorSession | null>;
}

export interface QueueRepository {
  create(input: Omit<Queue, "id" | "createdAt" | "updatedAt">): Promise<Queue>;
  delete(id: string, organizationId: string): Promise<boolean>;
  findById(id: string): Promise<Queue | null>;
  findByName(organizationId: string, name: string): Promise<Queue | null>;
  listByOrganization(organizationId: string): Promise<Queue[]>;
  update(id: string, organizationId: string, input: Partial<Pick<Queue, "name" | "priority" | "maxWaitingTime" | "overflowQueueId" | "active">>): Promise<Queue | null>;
}

export interface QueueMemberRepository {
  create(input: Omit<QueueMember, "id" | "createdAt" | "updatedAt">): Promise<QueueMember>;
  listByAgent(organizationId: string, agentId: string): Promise<QueueMember[]>;
  listByOrganization(organizationId: string): Promise<QueueMember[]>;
  listByQueue(organizationId: string, queueId: string): Promise<QueueMember[]>;
  update(id: string, organizationId: string, input: Partial<Pick<QueueMember, "role" | "active">>): Promise<QueueMember | null>;
}

export interface RoutingRuleRepository {
  create(input: Omit<RoutingRule, "id" | "createdAt" | "updatedAt">): Promise<RoutingRule>;
  listByOrganization(organizationId: string): Promise<RoutingRule[]>;
  update(id: string, organizationId: string, input: Partial<Pick<RoutingRule, "name" | "priority" | "requiredSkills" | "conditions" | "targetQueueId" | "escalationQueueId" | "action" | "active">>): Promise<RoutingRule | null>;
}

export interface RoutingDecisionRepository {
  create(input: Omit<RoutingDecision, "id">): Promise<RoutingDecision>;
  listByOrganization(organizationId: string, limit?: number): Promise<RoutingDecision[]>;
  listByQueueSession(organizationId: string, queueSessionId: string): Promise<RoutingDecision[]>;
}

export interface QueueSessionRepository {
  create(input: Omit<QueueSession, "id" | "createdAt" | "updatedAt">): Promise<QueueSession>;
  findById(id: string): Promise<QueueSession | null>;
  listByAgent(organizationId: string, agentId: string): Promise<QueueSession[]>;
  listByOrganization(organizationId: string): Promise<QueueSession[]>;
  listByQueue(organizationId: string, queueId: string): Promise<QueueSession[]>;
  update(id: string, organizationId: string, input: Partial<Pick<QueueSession, "queueId" | "assignedAgentId" | "priority" | "status" | "routingReason" | "escalationPath" | "assignedAt" | "completedAt" | "abandonedAt">>): Promise<QueueSession | null>;
}

export interface AgentSkillRepository {
  create(input: Omit<AgentSkill, "id" | "createdAt" | "updatedAt">): Promise<AgentSkill>;
  listByAgent(organizationId: string, agentId: string): Promise<AgentSkill[]>;
  listByOrganization(organizationId: string): Promise<AgentSkill[]>;
  update(id: string, organizationId: string, input: Partial<Pick<AgentSkill, "skill" | "level" | "certified" | "active">>): Promise<AgentSkill | null>;
}

export interface ExternalActionRepository {
  lookupLead(input: TenantLeadInput): Promise<Record<string, unknown> | null>;
  updateLead(input: TenantLeadInput & { update: Record<string, unknown> }): Promise<Record<string, unknown> | null>;
  updateContact(input: TenantLeadInput & { update: Record<string, unknown> }): Promise<Record<string, unknown> | null>;
  createNote(input: TenantLeadInput & { content: string }): Promise<Record<string, unknown>>;
  createActivity(input: TenantLeadInput & { type: string; title: string; description: string }): Promise<Record<string, unknown>>;
  lookupMemory(input: TenantLeadInput): Promise<Record<string, unknown>>;
  createMemory(input: TenantLeadInput & { summary: string; source: string }): Promise<Record<string, unknown>>;
  updatePreference(input: TenantLeadInput & { update: Record<string, unknown> }): Promise<Record<string, unknown> | null>;
  createTimelineEvent(input: TenantLeadInput & { eventType: string; title: string; description: string; metadata?: Record<string, unknown> }): Promise<Record<string, unknown>>;
}

export interface TenantLeadInput {
  organizationId: string;
  leadId: string;
}

export interface RuntimeMetrics {
  activeSessions: number;
  completedSessions: number;
  handoffDecisions: number;
  averageConfidence: number;
  hotLeads: number;
  actionSuccessRate?: number;
  pendingFollowups?: number;
}

export interface AgentPersonaSeed {
  name: string;
  role: AgentPersonaRole;
  systemPrompt: string;
  tone: string;
  goals: string[];
  constraints: string[];
}

export interface RuntimeDecisionInput {
  agentSessionId: string;
  aiConversationId: string | null;
  organizationId: string;
  type: AgentDecisionType;
  state: ConversationStateName;
  decision: string;
  confidence: number;
  reasoning: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface SessionUpdateInput {
  status?: AgentSessionStatus;
  endedAt?: Date | null;
  lastTranscriptAt?: Date | null;
  confidence?: number;
  aiConversationId?: string | null;
}

export interface PlannedWorkflowAction {
  actionType: WorkflowActionType;
  toolName: string;
  input: Record<string, unknown>;
  reasoning: string;
  confidence: number;
  condition?: string;
}

export interface SupervisorOverview {
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

export interface AgentAssistSuggestion {
  sessionId: string;
  suggestedResponses: string[];
  objectionHints: string[];
  memoryInsights: string[];
  qualificationInsights: string[];
  recommendedNextActions: string[];
}

export interface QueueHealth {
  queueId: string;
  queueName: string;
  waiting: number;
  assigned: number;
  averageWaitTime: number;
  longestWaitTime: number;
  activeAgents: number;
  priority: number;
}
