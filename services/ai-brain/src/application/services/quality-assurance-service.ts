import type { AgentDecision } from "../../domain/entities/agent-decision.js";
import type { AIConversation } from "../../domain/entities/ai-conversation.js";
import type { LeadQualification } from "../../domain/entities/lead-qualification.js";
import type { QualityScore } from "../../domain/entities/quality-score.js";
import type { QualityScoreRepository } from "../ports.js";

export class QualityAssuranceService {
  constructor(private readonly qualityScores: QualityScoreRepository) {}

  async scoreConversation(input: {
    conversation: AIConversation;
    decisions: AgentDecision[];
    qualification: LeadQualification | null;
    agentSessionId: string | null;
  }): Promise<QualityScore> {
    const { conversation, decisions, qualification } = input;
    const facts = Object.keys(conversation.state.collectedFacts).length;
    const qualificationSignals = [
      conversation.state.qualificationProgress.budget,
      conversation.state.qualificationProgress.urgency,
      conversation.state.qualificationProgress.authority,
      qualification?.needDetected ?? false,
      qualification?.timelineDetected ?? false,
    ].filter(Boolean).length;
    const handoffs = decisions.filter((decision) => decision.type === "HANDOFF").length;
    const toolFailures = decisions.filter((decision) => decision.type === "TOOL_CALL" && decision.confidence < 0.5).length;

    const greetingQuality = conversation.startedAt ? 85 : 40;
    const discoveryQuality = clamp(55 + facts * 10, 0, 100);
    const qualificationQuality = clamp(45 + qualificationSignals * 11, 0, 100);
    const objectionHandling = clamp(80 - conversation.customerConcerns.length * 8 + decisions.length * 1.5, 0, 100);
    const complianceScore = clamp(92 - toolFailures * 15, 0, 100);
    const closingQuality = clamp(50 + conversation.nextActions.length * 12 + (conversation.outcome ? 18 : 0) - handoffs * 4, 0, 100);
    const overallScore = average([
      greetingQuality,
      discoveryQuality,
      qualificationQuality,
      objectionHandling,
      complianceScore,
      closingQuality,
    ]);

    return this.qualityScores.upsert({
      organizationId: conversation.organizationId,
      conversationId: conversation.id,
      agentSessionId: input.agentSessionId,
      greetingQuality,
      discoveryQuality,
      qualificationQuality,
      objectionHandling,
      complianceScore,
      closingQuality,
      overallScore,
      reasoning: `QA scored from ${facts} collected facts, ${qualificationSignals} qualification signals, ${conversation.customerConcerns.length} concerns, and ${conversation.nextActions.length} next actions.`,
    });
  }
}

function average(values: number[]): number {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
