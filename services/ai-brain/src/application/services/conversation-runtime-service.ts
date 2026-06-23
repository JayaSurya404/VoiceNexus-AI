import type {
  RuntimeConversationTurn,
  RuntimeProviderName
} from "../../domain/entities/runtime-orchestration.js";
import type {
  MongoRuntimeConversationTurnRepository,
  MongoRuntimeSessionRepository
} from "../../infrastructure/database/mongoose/repositories/runtime-orchestration-repositories.js";
import type { ChatMessage } from "../../providers/chat-provider.js";
import type { ProviderRuntimeSelectionService } from "./provider-runtime-selection-service.js";
import type { RuntimeIncidentService } from "./runtime-incident-service.js";
import type { RuntimeRealtimeEventService } from "./runtime-realtime-event-service.js";

export interface RuntimeCitationInput {
  documentId: string;
  chunkId?: string;
  title?: string;
  url?: string;
}

export interface HandleRuntimeMessageInput {
  organizationId: string;
  sessionId: string;
  userMessage: string;
  memoryContext?: string;
  crmContext?: string;
  knowledgeContext?: string;
  citations?: RuntimeCitationInput[];
}

export class ConversationRuntimeService {
  public constructor(
    private readonly sessions: MongoRuntimeSessionRepository,
    private readonly turns: MongoRuntimeConversationTurnRepository,
    private readonly providerSelection: ProviderRuntimeSelectionService,
    private readonly incidents: RuntimeIncidentService,
    private readonly realtime: RuntimeRealtimeEventService
  ) {}

  public async handleUserMessage(input: HandleRuntimeMessageInput): Promise<RuntimeConversationTurn> {
    const session = await this.sessions.findById(input.organizationId, input.sessionId);
    if (!session) {
      await this.incidents.create({
        organizationId: input.organizationId,
        sessionId: input.sessionId,
        severity: "MEDIUM",
        category: "UNKNOWN",
        message: "Runtime session was not found for conversation turn"
      });
      throw new Error("Runtime session not found");
    }

    const messages = this.assemblePrompt(input);
    const completion = await this.providerSelection.completeWithFallback(input.organizationId, input.sessionId, {
      messages,
      model: session.model,
      temperature: 0.2
    });

    const turn = await this.turns.create({
      organizationId: input.organizationId,
      sessionId: input.sessionId,
      conversationId: session.conversationId,
      userMessage: input.userMessage,
      assistantMessage: completion.output.content,
      provider: completion.selection.provider,
      model: completion.selection.model,
      citations: input.citations ?? [],
      confidence: completion.fallbackUsed ? 0.76 : 0.9,
      fallbackUsed: completion.fallbackUsed
    });

    await this.realtime.publish(input.organizationId, "runtime.conversation.turn.completed", { turn });
    return turn;
  }

  public listTurns(organizationId: string, sessionId: string): Promise<RuntimeConversationTurn[]> {
    return this.turns.listBySession(organizationId, sessionId);
  }

  private assemblePrompt(input: HandleRuntimeMessageInput): ChatMessage[] {
    const contextLines = [
      input.memoryContext ? `Memory context:\n${input.memoryContext}` : "",
      input.crmContext ? `CRM context:\n${input.crmContext}` : "",
      input.knowledgeContext ? `Knowledge retrieval context:\n${input.knowledgeContext}` : ""
    ].filter((line) => line.length > 0);

    return [
      {
        role: "system",
        content:
          "You are the VoiceNexus runtime agent. Use memory, CRM, and retrieved knowledge context. Cite knowledge-backed claims when citations are available."
      },
      ...(contextLines.length > 0
        ? [
            {
              role: "system" as const,
              content: contextLines.join("\n\n")
            }
          ]
        : []),
      {
        role: "user",
        content: input.userMessage
      }
    ];
  }
}

export const runtimeProviderFromTurn = (turn: RuntimeConversationTurn): RuntimeProviderName => turn.provider;
