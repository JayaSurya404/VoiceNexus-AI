export interface FollowupDecision {
  shouldSchedule: boolean;
  reason: string;
  suggestedTimeframe: string | null;
  confidence: number;
}

export class FollowupDecisionService {
  decide(transcript: string): FollowupDecision {
    const text = transcript.toLowerCase();

    if (/call later|tomorrow|next week|send details|follow.?up/.test(text)) {
      return {
        shouldSchedule: true,
        reason: "Customer indicated a future follow-up preference.",
        suggestedTimeframe: /tomorrow/.test(text) ? "tomorrow" : /next week/.test(text) ? "next week" : "within 24 hours",
        confidence: 0.82,
      };
    }

    return { shouldSchedule: false, reason: "No explicit follow-up request detected.", suggestedTimeframe: null, confidence: 0.72 };
  }
}
