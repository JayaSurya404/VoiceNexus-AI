import type {
  AgentDecisionRepository,
  AgentSessionRepository,
  AIConversationRepository,
  AIMessageRepository,
} from "../ports.js";
import { CallSessionModel } from "../../infrastructure/database/mongoose/models/external-models.js";
import { objectIdOrThrow } from "../../infrastructure/database/mongoose/repositories/repository-utils.js";
import type { ToolRouter } from "../../tools/tool-router.js";
import { ContextBuilder } from "./context-builder.js";
import { AgentPersonaService } from "./agent-persona-service.js";
import { ConversationStateService, decisionFromState } from "./conversation-state-service.js";
import { ConversationSummaryEngine } from "./conversation-summary-engine.js";
import { FollowupDecisionService } from "./followup-decision-service.js";
import { HumanHandoffService } from "./human-handoff-service.js";
import { LeadQualificationRuntime } from "./lead-qualification-runtime.js";
import { MemoryInjectionService } from "./memory-injection-service.js";
import { ObjectionHandlerService } from "./objection-handler-service.js";
import { PromptEngineService } from "./prompt-engine-service.js";
import { ResponseGenerationService } from "./response-generation-service.js";
import { WorkflowEngineService } from "./workflow-engine-service.js";
import { VoiceResponseRequestService } from "./voice-response-request-service.js";
import type { LiveTakeoverService } from "./live-takeover-service.js";
import type { RagRuntimeService } from "./rag-runtime-service.js";

export interface FinalTranscriptEvent {
  organizationId: string;
  callSessionId: string;
  text: string;
  sequenceNumber: number;
  createdAt: string;
}

export class AgentRuntimeService {
  constructor(
    private readonly sessions: AgentSessionRepository,
    private readonly conversations: AIConversationRepository,
    private readonly messages: AIMessageRepository,
    private readonly decisions: AgentDecisionRepository,
    private readonly personas: AgentPersonaService,
    private readonly contextBuilder: ContextBuilder,
    private readonly memoryInjection: MemoryInjectionService,
    private readonly stateService: ConversationStateService,
    private readonly promptEngine: PromptEngineService,
    private readonly qualificationRuntime: LeadQualificationRuntime,
    private readonly objectionHandler: ObjectionHandlerService,
    private readonly followupDecision: FollowupDecisionService,
    private readonly handoffService: HumanHandoffService,
    private readonly responseGeneration: ResponseGenerationService,
    private readonly summaryEngine: ConversationSummaryEngine,
    private readonly toolRouter: ToolRouter,
    private readonly workflowEngine: WorkflowEngineService,
    private readonly liveTakeover: LiveTakeoverService,
    private readonly voiceResponseRequests: VoiceResponseRequestService,
    private readonly ragRuntime: RagRuntimeService,
  ) {}

  async processTranscript(event: FinalTranscriptEvent): Promise<void> {
    if (!event.text.trim()) return;

    const call = await CallSessionModel.findOne({
      _id: objectIdOrThrow(event.callSessionId),
      organizationId: objectIdOrThrow(event.organizationId),
    }).lean();

    if (!call) {
      console.warn(`[ai-brain] Ignoring transcript for unknown call ${event.callSessionId}`);
      return;
    }

    const leadId = stringId((call as Record<string, unknown>).leadId);
    const persona = await this.personas.defaultForOrganization(event.organizationId);
    const conversation =
      (await this.conversations.findByCall(event.organizationId, event.callSessionId)) ??
      (await this.conversations.create({
        organizationId: event.organizationId,
        leadId,
        callId: event.callSessionId,
        status: "ACTIVE",
        currentIntent: "runtime_started",
        sentiment: "UNKNOWN",
        leadScore: 0,
        summary: null,
        outcome: null,
        nextActions: [],
        actionItems: [],
        customerConcerns: [],
        opportunities: [],
        state: {
          detectedLanguage: null,
          qualificationProgress: { budget: false, urgency: false, authority: false },
          collectedFacts: {},
          lastResponse: null,
        },
        startedAt: dateValue((call as Record<string, unknown>).startedAt) ?? new Date(event.createdAt),
        endedAt: null,
      }));
    const session =
      (await this.sessions.findByCall(event.organizationId, event.callSessionId)) ??
      (await this.sessions.create({
        organizationId: event.organizationId,
        agentPersonaId: persona.id,
        leadId,
        callId: event.callSessionId,
        aiConversationId: conversation.id,
        status: "ACTIVE",
        startedAt: new Date(event.createdAt),
        endedAt: null,
        lastTranscriptAt: new Date(event.createdAt),
        confidence: 0.75,
      }));

    await this.sessions.update(session.id, { aiConversationId: conversation.id, lastTranscriptAt: new Date(event.createdAt) });
    await this.messages.create({
      conversationId: conversation.id,
      role: "user",
      content: event.text,
      tokens: estimateTokens(event.text),
      timestamp: new Date(event.createdAt),
    });

    const [history, context] = await Promise.all([
      this.messages.listByConversation(conversation.id),
      this.contextBuilder.build({ organizationId: event.organizationId, callId: event.callSessionId, leadId }),
    ]);
    const transcript = history.filter((message) => message.role === "user").map((message) => message.content).join("\n");
    const memory = this.memoryInjection.build(context);
    const knowledge = await this.ragRuntime.buildContext({
      organizationId: event.organizationId,
      query: event.text,
      transcript,
      crmContext: {
        lead: context.lead,
        notes: context.notes,
        timeline: context.timeline,
        callHistory: context.previousCalls,
      },
      memoryContext: memory as unknown as Record<string, unknown>,
      conversationId: conversation.id,
      agentSessionId: session.id,
    });
    const restoredState = await this.stateService.restoreOrCreate(session);
    const objection = this.objectionHandler.detect(event.text);
    const handoff = this.handoffService.decide({
      transcript: event.text,
      sentiment: restoredState.sentiment,
      confidence: restoredState.confidence,
    });
    const qualification = await this.qualificationRuntime.qualify({
      organizationId: event.organizationId,
      leadId,
      conversationId: conversation.id,
      agentSessionId: session.id,
      transcript,
      context,
    });
    const state = await this.stateService.transition({
      current: restoredState,
      transcript: event.text,
      qualificationScore: qualification?.score ?? 0,
      objectionDetected: objection.detected,
      handoffRequired: handoff.shouldHandoff,
    });
    const followup = this.followupDecision.decide(event.text);
    await this.workflowEngine.executeForTranscript({
      organizationId: event.organizationId,
      session: { ...session, aiConversationId: conversation.id },
      conversationId: conversation.id,
      leadId,
      transcript: event.text,
      qualification,
      objection,
      followup,
      handoff,
    });
    const response = await this.responseGeneration.generate({
      messages: this.promptEngine.build({ context, memory, knowledge, persona, state, transcript }),
      tools: this.toolRouter.definitions(),
    });

    await Promise.all([
      this.decisions.create(decisionFromState(state, { ...session, aiConversationId: conversation.id })),
      this.decisions.create({
        organizationId: event.organizationId,
        agentSessionId: session.id,
        aiConversationId: conversation.id,
        type: "QUALIFICATION",
        state: state.state,
        decision: qualification?.interestLevel ?? "UNKNOWN",
        confidence: qualification?.confidence ?? 0.5,
        reasoning: qualification?.qualificationReason ?? "No lead linked for qualification.",
        metadata: qualification ? { score: qualification.score } : {},
        createdAt: new Date(),
      }),
      objection.detected
        ? this.decisions.create({
            organizationId: event.organizationId,
            agentSessionId: session.id,
            aiConversationId: conversation.id,
            type: "OBJECTION",
            state: state.state,
            decision: objection.type,
            confidence: objection.confidence,
            reasoning: objection.responseGuidance,
            metadata: {},
            createdAt: new Date(),
          })
        : Promise.resolve(null),
      followup.shouldSchedule
        ? this.decisions.create({
            organizationId: event.organizationId,
            agentSessionId: session.id,
            aiConversationId: conversation.id,
            type: "FOLLOWUP",
            state: state.state,
            decision: followup.suggestedTimeframe ?? "follow_up",
            confidence: followup.confidence,
            reasoning: followup.reason,
            metadata: { ...followup },
            createdAt: new Date(),
          })
        : Promise.resolve(null),
      handoff.shouldHandoff
        ? this.decisions.create({
            organizationId: event.organizationId,
            agentSessionId: session.id,
            aiConversationId: conversation.id,
            type: "HANDOFF",
            state: state.state,
            decision: "human_handoff",
            confidence: handoff.confidence,
            reasoning: handoff.reason,
            metadata: {},
            createdAt: new Date(),
          })
        : Promise.resolve(null),
    ]);

    for (const call of response.toolCalls) {
      await this.toolRouter.execute(call, {
        organizationId: event.organizationId,
        leadId,
        conversationId: conversation.id,
        agentSessionId: session.id,
      });
      await this.decisions.create({
        organizationId: event.organizationId,
        agentSessionId: session.id,
        aiConversationId: conversation.id,
        type: "TOOL_CALL",
        state: state.state,
        decision: call.name,
        confidence: 0.75,
        reasoning: "Tool call requested by response generation.",
        metadata: call.arguments,
        createdAt: new Date(),
      });
    }

    const summary = await this.summaryEngine.summarize({ transcript, context });
    await this.messages.create({
      conversationId: conversation.id,
      role: "assistant",
      content: response.content,
      tokens: response.tokens,
      timestamp: new Date(),
    });
    if (!(await this.liveTakeover.isAiObserveMode({ organizationId: event.organizationId, aiSessionId: session.id }))) {
      await this.voiceResponseRequests.request({
        organizationId: event.organizationId,
        callId: event.callSessionId,
        sessionId: session.id,
        leadId,
        responseText: response.content,
      });
    }
    await this.conversations.update(conversation.id, {
      currentIntent: state.detectedIntent,
      sentiment: state.sentiment,
      leadScore: qualification?.score ?? conversation.leadScore,
      summary: summary.summary,
      outcome: summary.outcome,
      nextActions: [...summary.nextActions, ...(followup.shouldSchedule ? [`Follow up ${followup.suggestedTimeframe}`] : [])],
      actionItems: summary.actionItems,
      customerConcerns: summary.customerConcerns,
      opportunities: summary.opportunities,
      state: {
        detectedLanguage: state.detectedLanguage,
        qualificationProgress: {
          budget: qualification?.budgetDetected ?? false,
          urgency: qualification?.timelineDetected ?? false,
          authority: qualification?.authorityDetected ?? false,
        },
        collectedFacts: state.collectedFacts,
        lastResponse: response.content,
      },
    });
    await this.sessions.update(session.id, {
      confidence: Math.min(response.confidence, qualification?.confidence ?? response.confidence),
      status: state.state === "COMPLETED" ? "COMPLETED" : state.state === "TRANSFER" ? "TRANSFERRED" : "ACTIVE",
      endedAt: state.state === "COMPLETED" || state.state === "TRANSFER" ? new Date() : null,
    });
    await this.decisions.create({
      organizationId: event.organizationId,
      agentSessionId: session.id,
      aiConversationId: conversation.id,
      type: "RESPONSE",
      state: state.state,
      decision: "generated_text_response",
      confidence: response.confidence,
      reasoning: response.content,
      metadata: { tokens: response.tokens },
      createdAt: new Date(),
    });

    console.log(`[ai-brain] Runtime processed transcript ${event.sequenceNumber} for session ${session.id}`);
  }
}

function stringId(value: unknown): string | null {
  return value && typeof value === "object" && "toString" in value ? String(value) : null;
}

function dateValue(value: unknown): Date | null {
  return value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
