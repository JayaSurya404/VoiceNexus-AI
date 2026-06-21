import type { ConversationStateRepository, RuntimeDecisionInput } from "../ports.js";
import type { AgentSession } from "../../domain/entities/agent-session.js";
import type { ConversationState, ConversationStateName } from "../../domain/entities/conversation-state.js";

export class ConversationStateService {
  constructor(private readonly states: ConversationStateRepository) {}

  async restoreOrCreate(session: AgentSession): Promise<ConversationState> {
    const existing = await this.states.findBySession(session.id);

    if (existing) {
      return existing;
    }

    return this.states.upsert({
      organizationId: session.organizationId,
      agentSessionId: session.id,
      leadId: session.leadId,
      callId: session.callId,
      state: "GREETING",
      previousState: null,
      detectedIntent: "greeting",
      detectedLanguage: null,
      sentiment: "UNKNOWN",
      confidence: 0.75,
      collectedFacts: {},
      transitionReason: "New agent session initialized",
      updatedAt: new Date(),
    });
  }

  async transition(input: {
    current: ConversationState;
    transcript: string;
    qualificationScore: number;
    objectionDetected: boolean;
    handoffRequired: boolean;
  }): Promise<ConversationState> {
    const nextState = decideNextState(input);

    if (nextState === input.current.state) {
      return this.states.upsert({ ...input.current, updatedAt: new Date(), transitionReason: "State restored without transition" });
    }

    return this.states.upsert({
      ...input.current,
      state: nextState,
      previousState: input.current.state,
      detectedIntent: intentFromText(input.transcript),
      sentiment: sentimentFromText(input.transcript),
      confidence: input.handoffRequired ? 0.45 : Math.max(0.65, input.current.confidence),
      transitionReason: `Transitioned from ${input.current.state} to ${nextState}`,
      updatedAt: new Date(),
    });
  }
}

export function decisionFromState(state: ConversationState, session: AgentSession): RuntimeDecisionInput {
  return {
    agentSessionId: session.id,
    aiConversationId: session.aiConversationId,
    organizationId: session.organizationId,
    type: "STATE_TRANSITION",
    state: state.state,
    decision: state.state,
    confidence: state.confidence,
    reasoning: state.transitionReason,
    metadata: {},
    createdAt: new Date(),
  };
}

function decideNextState(input: {
  current: ConversationState;
  transcript: string;
  qualificationScore: number;
  objectionDetected: boolean;
  handoffRequired: boolean;
}): ConversationStateName {
  const text = input.transcript.toLowerCase();

  if (input.handoffRequired) return "TRANSFER";
  if (/bye|thank you|that's all|done/.test(text)) return "COMPLETED";
  if (input.objectionDetected) return "OBJECTION";
  if (/price|cost|fee|pricing|expensive/.test(text)) return "PRICING";
  if (/follow.?up|call later|tomorrow|next week/.test(text)) return "FOLLOWUP";
  if (input.qualificationScore >= 65 || /budget|decision|need|timeline|urgent/.test(text)) return "QUALIFICATION";
  if (input.current.state === "GREETING") return "DISCOVERY";
  return input.current.state;
}

function intentFromText(text: string): string {
  if (/price|cost|fee/.test(text.toLowerCase())) return "pricing";
  if (/human|agent|representative/.test(text.toLowerCase())) return "human_handoff";
  if (/later|follow/.test(text.toLowerCase())) return "follow_up";
  return "discovery";
}

function sentimentFromText(text: string): ConversationState["sentiment"] {
  if (/angry|bad|stop|not interested|annoyed/.test(text.toLowerCase())) return "NEGATIVE";
  if (/great|good|interested|yes|sure/.test(text.toLowerCase())) return "POSITIVE";
  return "NEUTRAL";
}
