import type { AIProvider } from "../../providers/ai-provider.js";
import type { ConversationContext } from "./context-builder.js";

export interface ConversationSummary {
  summary: string;
  outcome: string;
  nextActions: string[];
  actionItems: string[];
  customerConcerns: string[];
  opportunities: string[];
}

export class ConversationSummaryEngine {
  constructor(private readonly provider: AIProvider) {}

  async summarize(input: { transcript: string; context: ConversationContext }): Promise<ConversationSummary> {
    try {
      return await this.provider.generateJson<ConversationSummary>({
        schemaName: "conversation_summary",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            summary: { type: "string" },
            outcome: { type: "string" },
            nextActions: { type: "array", items: { type: "string" } },
            actionItems: { type: "array", items: { type: "string" } },
            customerConcerns: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
          },
          required: ["summary", "outcome", "nextActions", "actionItems", "customerConcerns", "opportunities"],
        },
        messages: [
          { role: "system", content: "Summarize this customer conversation for CRM operators. Return JSON only." },
          { role: "user", content: JSON.stringify({ transcript: input.transcript, lead: input.context.lead }) },
        ],
      });
    } catch {
      return {
        summary: input.transcript.slice(-700),
        outcome: "Runtime transcript processed.",
        nextActions: [],
        actionItems: [],
        customerConcerns: [],
        opportunities: [],
      };
    }
  }
}
