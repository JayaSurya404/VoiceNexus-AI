import type {
  AgentAssistSuggestion,
  AgentDecisionRepository,
  AgentSessionRepository,
  LeadQualificationRepository,
  ToolExecutionRepository,
} from "../ports.js";
import type { ResponseGenerationService } from "./response-generation-service.js";

export class AgentAssistService {
  constructor(
    private readonly sessions: AgentSessionRepository,
    private readonly decisions: AgentDecisionRepository,
    private readonly qualifications: LeadQualificationRepository,
    private readonly tools: ToolExecutionRepository,
    private readonly responseGeneration: ResponseGenerationService,
  ) {}

  async suggest(sessionId: string): Promise<AgentAssistSuggestion | null> {
    const session = await this.sessions.findById(sessionId);
    if (!session) return null;
    const [decisions, tools, qualification] = await Promise.all([
      this.decisions.listBySession(session.id),
      session.aiConversationId ? this.tools.listByConversation(session.aiConversationId) : Promise.resolve([]),
      session.leadId ? this.qualifications.findByLead(session.organizationId, session.leadId) : Promise.resolve(null),
    ]);
    const context = [
      `Session confidence: ${session.confidence}`,
      `Latest decisions: ${decisions.slice(0, 5).map((decision) => `${decision.type}: ${decision.decision}`).join("; ")}`,
      `Tool activity: ${tools.slice(0, 5).map((tool) => `${tool.toolName}:${tool.success ? "success" : "failed"}`).join("; ")}`,
      qualification ? `Qualification: ${qualification.interestLevel} ${qualification.score}. ${qualification.qualificationReason}` : "",
    ].join("\n");
    const generated = await this.responseGeneration.generate({
      messages: [
        {
          role: "system",
          content:
            "You are an agent-assist copilot. Return concise bullet suggestions for a human contact-center agent. Do not speak as the customer.",
        },
        { role: "user", content: context },
      ],
      tools: [],
    });
    const lines = generated.content.split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean);

    return {
      sessionId,
      suggestedResponses: lines.slice(0, 3),
      objectionHints: decisions.filter((decision) => decision.type === "OBJECTION").map((decision) => decision.reasoning).slice(0, 3),
      memoryInsights: decisions.map((decision) => decision.reasoning).slice(0, 3),
      qualificationInsights: qualification ? [qualification.qualificationReason] : [],
      recommendedNextActions: lines.slice(3, 6),
    };
  }
}
