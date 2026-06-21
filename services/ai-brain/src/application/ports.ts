import type { AgentDecision, AgentDecisionType } from "../domain/entities/agent-decision.js";
import type { AgentPersona, AgentPersonaRole } from "../domain/entities/agent-persona.js";
import type { AgentSession, AgentSessionStatus } from "../domain/entities/agent-session.js";
import type { AIConversation } from "../domain/entities/ai-conversation.js";
import type { AIMessage } from "../domain/entities/ai-message.js";
import type { ConversationState, ConversationStateName } from "../domain/entities/conversation-state.js";
import type { LeadQualification } from "../domain/entities/lead-qualification.js";
import type { ToolExecution } from "../domain/entities/tool-execution.js";

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

export interface RuntimeMetrics {
  activeSessions: number;
  completedSessions: number;
  handoffDecisions: number;
  averageConfidence: number;
  hotLeads: number;
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
