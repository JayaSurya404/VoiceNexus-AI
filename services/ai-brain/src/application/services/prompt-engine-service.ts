import type { AgentPersona } from "../../domain/entities/agent-persona.js";
import type { ConversationState } from "../../domain/entities/conversation-state.js";
import type { ProviderMessage } from "../../providers/ai-provider.js";
import type { ConversationContext } from "./context-builder.js";
import type { InjectedMemoryContext } from "./memory-injection-service.js";

export class PromptEngineService {
  build(input: {
    context: ConversationContext;
    memory: InjectedMemoryContext;
    persona: AgentPersona;
    state: ConversationState;
    transcript: string;
  }): ProviderMessage[] {
    return [
      {
        role: "system",
        content: [
          input.persona.systemPrompt,
          `Tone: ${input.persona.tone}`,
          `Goals: ${input.persona.goals.join("; ")}`,
          `Constraints: ${input.persona.constraints.join("; ")}`,
          "You are a text reasoning runtime for a future voice agent. Do not produce audio, TTS, WhatsApp, email, or campaign actions.",
          "Use tools only for durable CRM, note, activity, memory lookup, lead update, or follow-up scheduling actions.",
        ].join("\n"),
      },
      {
        role: "user",
        content: JSON.stringify({
          crm: {
            lead: input.context.lead,
            notes: input.context.notes,
            callHistory: input.context.previousCalls,
          },
          memory: input.memory,
          timeline: input.context.timeline,
          currentState: input.state,
          currentTranscript: input.transcript,
          instruction:
            "Reason about the customer. Generate the next concise text response and request tool calls only when warranted.",
        }),
      },
    ];
  }
}
