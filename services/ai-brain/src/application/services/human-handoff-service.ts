import type { ConversationState } from "../../domain/entities/conversation-state.js";

export interface HandoffDecision {
  shouldHandoff: boolean;
  reason: string;
  confidence: number;
}

export class HumanHandoffService {
  decide(input: {
    transcript: string;
    sentiment: ConversationState["sentiment"];
    confidence: number;
    unsupportedRequest?: boolean;
  }): HandoffDecision {
    const text = input.transcript.toLowerCase();

    if (/human|real agent|representative|manager|supervisor/.test(text)) {
      return { shouldHandoff: true, reason: "Customer requested a human agent.", confidence: 0.95 };
    }

    if (input.confidence < 0.5) {
      return { shouldHandoff: true, reason: "Runtime confidence dropped below the handoff threshold.", confidence: 0.7 };
    }

    if (input.unsupportedRequest) {
      return { shouldHandoff: true, reason: "Customer request is outside supported AI runtime scope.", confidence: 0.75 };
    }

    if (input.sentiment === "NEGATIVE" && /angry|stop calling|complaint|legal/.test(text)) {
      return { shouldHandoff: true, reason: "Negative sentiment requires human review.", confidence: 0.84 };
    }

    return { shouldHandoff: false, reason: "No handoff trigger detected.", confidence: 0.78 };
  }
}
