import type {
  KnowledgeFeedbackRepository,
  KnowledgeGapRepository,
  KnowledgeLearningEventRepository,
  KnowledgeSearchRepository,
} from "../ports.js";
import type { KnowledgeGap } from "../../domain/entities/knowledge-gap.js";

export class KnowledgeGapAnalysisService {
  constructor(
    private readonly gaps: KnowledgeGapRepository,
    private readonly searches: KnowledgeSearchRepository,
    private readonly feedback: KnowledgeFeedbackRepository,
    private readonly learningEvents: KnowledgeLearningEventRepository,
  ) {}

  async analyzeOrganization(organizationId: string): Promise<KnowledgeGap[]> {
    const [searches, feedback, events] = await Promise.all([
      this.searches.listByOrganization(organizationId),
      this.feedback.listByOrganization(organizationId),
      this.learningEvents.listByOrganization(organizationId),
    ]);
    const topics = new Map<string, {
      searchIds: string[];
      conversationIds: string[];
      confidences: number[];
      unanswered: number;
      escalations: number;
    }>();

    for (const search of searches.filter((item) => item.confidence < 0.45 || item.resultChunkIds.length === 0)) {
      const topic = normalizeTopic(search.query);
      const current = topics.get(topic) ?? { searchIds: [], conversationIds: [], confidences: [], unanswered: 0, escalations: 0 };
      current.searchIds.push(search.id);
      current.confidences.push(search.confidence);
      current.unanswered += search.resultChunkIds.length === 0 ? 1 : 0;
      topics.set(topic, current);
    }

    for (const item of feedback.filter((entry) => entry.type === "FAILED_SEARCH" || entry.type === "UNHELPFUL" || entry.type === "ESCALATED_CALL" || entry.type === "HUMAN_TAKEOVER")) {
      const topic = normalizeTopic(item.comment ?? item.type);
      const current = topics.get(topic) ?? { searchIds: [], conversationIds: [], confidences: [], unanswered: 0, escalations: 0 };
      if (item.searchId) current.searchIds.push(item.searchId);
      if (item.conversationId) current.conversationIds.push(item.conversationId);
      current.confidences.push(item.rating ? item.rating / 5 : 0.2);
      current.unanswered += item.type === "FAILED_SEARCH" || item.type === "UNHELPFUL" ? 1 : 0;
      current.escalations += item.type === "ESCALATED_CALL" || item.type === "HUMAN_TAKEOVER" ? 1 : 0;
      topics.set(topic, current);
    }

    for (const event of events.filter((item) => item.triggerReason === "LOW_RETRIEVAL_CONFIDENCE" || item.triggerReason === "FAILED_SEARCH" || item.triggerReason === "ESCALATION")) {
      const topic = normalizeTopic(event.topic);
      const current = topics.get(topic) ?? { searchIds: [], conversationIds: [], confidences: [], unanswered: 0, escalations: 0 };
      if (event.searchId) current.searchIds.push(event.searchId);
      if (event.sourceConversationId) current.conversationIds.push(event.sourceConversationId);
      current.confidences.push(event.confidence);
      current.escalations += event.triggerReason === "ESCALATION" ? 1 : 0;
      current.unanswered += event.triggerReason === "FAILED_SEARCH" ? 1 : 0;
      topics.set(topic, current);
    }

    const created: KnowledgeGap[] = [];
    for (const [topic, value] of topics.entries()) {
      const triggerCount = value.searchIds.length + value.conversationIds.length + value.unanswered + value.escalations;
      if (triggerCount < 1) continue;
      const averageConfidence = average(value.confidences);
      created.push(await this.gaps.upsert({
        organizationId,
        topic,
        description: `Knowledge gap detected for "${topic}" from low-confidence searches, unanswered feedback, or escalation signals.`,
        triggerCount,
        unansweredCount: value.unanswered,
        escalationCount: value.escalations,
        averageConfidence,
        severityScore: Math.min(100, value.unanswered * 20 + value.escalations * 25 + (1 - averageConfidence) * 40),
        status: "OPEN",
        sourceSearchIds: unique(value.searchIds),
        sourceConversationIds: unique(value.conversationIds),
      }));
    }
    return created;
  }
}

function normalizeTopic(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 160) || "unknown";
}

function average(values: number[]): number {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
