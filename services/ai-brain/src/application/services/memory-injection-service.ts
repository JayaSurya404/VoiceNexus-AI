import type { ConversationContext } from "./context-builder.js";

export interface InjectedMemoryContext {
  customerSummary: string;
  preferences: Record<string, unknown> | null;
  importantMemories: string[];
  previousObjections: string[];
  timelineHighlights: string[];
}

export class MemoryInjectionService {
  build(context: ConversationContext): InjectedMemoryContext {
    const importantMemories = context.memories
      .map((memory) => stringField(memory.summary) || stringField(memory.content))
      .filter(Boolean)
      .slice(0, 8);
    const timelineHighlights = context.timeline
      .map((event) => [stringField(event.eventType), stringField(event.title), stringField(event.description)].filter(Boolean).join(": "))
      .filter(Boolean)
      .slice(0, 8);
    const previousObjections = [...importantMemories, ...timelineHighlights].filter((item) =>
      /expensive|approval|not interested|competitor|later|price/i.test(item),
    );

    return {
      customerSummary: importantMemories.at(0) ?? "No durable customer memory recorded yet.",
      preferences: context.preferences,
      importantMemories,
      previousObjections,
      timelineHighlights,
    };
  }
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}
