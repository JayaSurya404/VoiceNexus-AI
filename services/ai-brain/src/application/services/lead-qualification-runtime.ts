import type { LeadQualificationRepository } from "../ports.js";
import type { LeadQualification } from "../../domain/entities/lead-qualification.js";
import type { AIProvider } from "../../providers/ai-provider.js";
import type { ConversationContext } from "./context-builder.js";

interface BantResult {
  budgetDetected: boolean;
  authorityDetected: boolean;
  needDetected: boolean;
  timelineDetected: boolean;
  score: number;
  confidence: number;
  reasoning: string;
  interestLevel: "HOT" | "WARM" | "COLD" | "UNKNOWN";
}

export class LeadQualificationRuntime {
  constructor(
    private readonly provider: AIProvider,
    private readonly qualifications: LeadQualificationRepository,
  ) {}

  async qualify(input: {
    organizationId: string;
    leadId: string | null;
    conversationId: string | null;
    agentSessionId: string | null;
    transcript: string;
    context: ConversationContext;
  }): Promise<LeadQualification | null> {
    if (!input.leadId) {
      return null;
    }

    const fallback = heuristicBant(input.transcript);
    let result = fallback;

    try {
      result = await this.provider.generateJson<BantResult>({
        schemaName: "lead_bant_qualification",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            budgetDetected: { type: "boolean" },
            authorityDetected: { type: "boolean" },
            needDetected: { type: "boolean" },
            timelineDetected: { type: "boolean" },
            score: { type: "number", minimum: 0, maximum: 100 },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            reasoning: { type: "string" },
            interestLevel: { type: "string", enum: ["HOT", "WARM", "COLD", "UNKNOWN"] },
          },
          required: [
            "budgetDetected",
            "authorityDetected",
            "needDetected",
            "timelineDetected",
            "score",
            "confidence",
            "reasoning",
            "interestLevel",
          ],
        },
        messages: [
          { role: "system", content: "Evaluate BANT qualification from transcript and CRM context. Return JSON only." },
          { role: "user", content: JSON.stringify({ transcript: input.transcript, lead: input.context.lead }) },
        ],
      });
    } catch (error) {
      console.warn("[ai-brain] BANT qualification fell back to heuristics", error);
    }

    const coldScore = Math.max(0, 100 - result.score);
    const warmScore = result.score >= 40 && result.score < 75 ? result.score : Math.max(0, 70 - Math.abs(result.score - 55));
    const hotScore = result.score >= 75 ? result.score : Math.max(0, result.score - 20);

    return this.qualifications.upsert({
      organizationId: input.organizationId,
      leadId: input.leadId,
      conversationId: input.conversationId,
      agentSessionId: input.agentSessionId,
      score: Math.round(result.score),
      confidence: clamp(result.confidence, 0, 1),
      hotScore: Math.round(hotScore),
      warmScore: Math.round(warmScore),
      coldScore: Math.round(coldScore),
      budgetDetected: result.budgetDetected,
      authorityDetected: result.authorityDetected,
      needDetected: result.needDetected,
      timelineDetected: result.timelineDetected,
      urgencyDetected: result.timelineDetected,
      decisionMakerDetected: result.authorityDetected,
      objections: detectObjections(input.transcript),
      interestLevel: result.interestLevel,
      qualificationReason: result.reasoning,
      updatedAt: new Date(),
    });
  }
}

function heuristicBant(transcript: string): BantResult {
  const text = transcript.toLowerCase();
  const budgetDetected = /budget|price|cost|afford|quote/.test(text);
  const authorityDetected = /i decide|owner|manager|approval|boss|director|founder/.test(text);
  const needDetected = /need|problem|looking for|interested|require|want/.test(text);
  const timelineDetected = /today|tomorrow|week|month|urgent|soon|later/.test(text);
  const score = [budgetDetected, authorityDetected, needDetected, timelineDetected].filter(Boolean).length * 25;
  return {
    budgetDetected,
    authorityDetected,
    needDetected,
    timelineDetected,
    score,
    confidence: 0.65,
    reasoning: "Heuristic BANT scoring based on detected buying signals.",
    interestLevel: score >= 75 ? "HOT" : score >= 40 ? "WARM" : score > 0 ? "COLD" : "UNKNOWN",
  };
}

function detectObjections(text: string): string[] {
  const patterns: Array<[string, RegExp]> = [
    ["too expensive", /expensive|costly|price high/],
    ["not interested", /not interested|no interest|don't need/],
    ["need approval", /approval|ask my boss|talk to my manager/],
    ["call later", /call later|later|busy|tomorrow/],
    ["using competitor", /competitor|already using|another provider/],
  ];
  return patterns.filter(([, pattern]) => pattern.test(text.toLowerCase())).map(([label]) => label);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
