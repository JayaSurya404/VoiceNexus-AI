import type { CallOutcomeRepository } from "../ports.js";
import type { AgentSession } from "../../domain/entities/agent-session.js";
import type { AIConversation } from "../../domain/entities/ai-conversation.js";
import type { CallOutcome, CallOutcomeType } from "../../domain/entities/call-outcome.js";

export class CallScoringService {
  constructor(private readonly callOutcomes: CallOutcomeRepository) {}

  async scoreConversation(
    conversation: AIConversation,
    session: AgentSession | null,
  ): Promise<CallOutcome> {
    const { confidence, outcome, reasoning } = inferOutcome(conversation, session);
    return this.callOutcomes.upsert({
      organizationId: conversation.organizationId,
      conversationId: conversation.id,
      agentSessionId: session?.id ?? null,
      leadId: conversation.leadId,
      callId: conversation.callId,
      outcome,
      confidence,
      reasoning,
      occurredAt: conversation.endedAt ?? conversation.updatedAt,
    });
  }
}

function inferOutcome(
  conversation: AIConversation,
  session: AgentSession | null,
): { outcome: CallOutcomeType; confidence: number; reasoning: string } {
  const text = `${conversation.outcome ?? ""} ${conversation.summary ?? ""} ${conversation.nextActions.join(" ")}`.toLowerCase();
  if (conversation.status === "FAILED" || session?.status === "FAILED") {
    return { outcome: "FAILED", confidence: 0.9, reasoning: "Conversation or AI session failed." };
  }
  if (session?.status === "TRANSFERRED" || text.includes("transfer")) {
    return { outcome: "TRANSFERRED", confidence: 0.82, reasoning: "Conversation was transferred or handoff was detected." };
  }
  if (text.includes("sale") || text.includes("won") || text.includes("purchased")) {
    return { outcome: "SALE", confidence: 0.78, reasoning: "Outcome text indicates a sale or won lead." };
  }
  if (text.includes("meeting") || text.includes("appointment") || text.includes("booked")) {
    return { outcome: "BOOKED_MEETING", confidence: 0.76, reasoning: "Next action indicates a booked meeting." };
  }
  if (text.includes("voicemail")) {
    return { outcome: "VOICEMAIL", confidence: 0.74, reasoning: "Conversation summary references voicemail." };
  }
  if (text.includes("not interested") || text.includes("no interest")) {
    return { outcome: "NO_INTEREST", confidence: 0.72, reasoning: "Conversation text indicates no interest." };
  }
  return { outcome: "FOLLOW_UP", confidence: 0.62, reasoning: "No terminal outcome detected; follow-up is recommended." };
}
