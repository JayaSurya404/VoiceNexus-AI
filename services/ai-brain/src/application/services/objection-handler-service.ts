export interface ObjectionResult {
  detected: boolean;
  type: "too_expensive" | "not_interested" | "need_approval" | "call_later" | "using_competitor" | "none";
  confidence: number;
  responseGuidance: string;
}

export class ObjectionHandlerService {
  detect(transcript: string): ObjectionResult {
    const text = transcript.toLowerCase();
    const matches: Array<Omit<ObjectionResult, "detected">> = [
      {
        type: "too_expensive",
        confidence: 0.85,
        responseGuidance: "Acknowledge price concern, reframe value, and ask what outcome would justify the investment.",
      },
      {
        type: "not_interested",
        confidence: 0.8,
        responseGuidance: "Respect the objection, ask one low-pressure discovery question, and offer to close politely.",
      },
      {
        type: "need_approval",
        confidence: 0.82,
        responseGuidance: "Ask who needs to be involved and offer a concise summary for the decision maker.",
      },
      {
        type: "call_later",
        confidence: 0.78,
        responseGuidance: "Confirm a specific follow-up time and summarize the reason for the follow-up.",
      },
      {
        type: "using_competitor",
        confidence: 0.8,
        responseGuidance: "Ask what they like and dislike about the current provider before positioning alternatives.",
      },
    ];
    const patterns = [/expensive|costly|price high/, /not interested|don't need/, /approval|boss|manager/, /call later|busy|tomorrow/, /competitor|already using/];
    const index = patterns.findIndex((pattern) => pattern.test(text));

    return index >= 0 ? { ...matches[index]!, detected: true } : { detected: false, type: "none", confidence: 0.7, responseGuidance: "Continue discovery." };
  }
}
