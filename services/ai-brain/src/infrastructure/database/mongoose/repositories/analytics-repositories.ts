import type {
  AgentPerformanceRepository,
  CallOutcomeRepository,
  ConversationAnalyticsRepository,
  QualityScoreRepository,
  QueueAnalyticsRepository,
  SentimentAnalysisRepository,
} from "../../../../application/ports.js";
import type { AgentPerformance } from "../../../../domain/entities/agent-performance.js";
import type { CallOutcome } from "../../../../domain/entities/call-outcome.js";
import type { ConversationAnalytics } from "../../../../domain/entities/conversation-analytics.js";
import type { QualityScore } from "../../../../domain/entities/quality-score.js";
import type { QueueAnalytics } from "../../../../domain/entities/queue-analytics.js";
import type { SentimentAnalysis } from "../../../../domain/entities/sentiment-analysis.js";
import { AgentPerformanceModel } from "../models/agent-performance-model.js";
import { CallOutcomeModel } from "../models/call-outcome-model.js";
import { ConversationAnalyticsModel } from "../models/conversation-analytics-model.js";
import { QualityScoreModel } from "../models/quality-score-model.js";
import { QueueAnalyticsModel } from "../models/queue-analytics-model.js";
import { SentimentAnalysisModel } from "../models/sentiment-analysis-model.js";
import {
  toAgentPerformance,
  toCallOutcome,
  toConversationAnalytics,
  toQualityScore,
  toQueueAnalytics,
  toSentimentAnalysis,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoConversationAnalyticsRepository implements ConversationAnalyticsRepository {
  async listByOrganization(organizationId: string) {
    const docs = await ConversationAnalyticsModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toConversationAnalytics(doc as AnyDoc));
  }

  async upsert(input: Omit<ConversationAnalytics, "id" | "createdAt" | "updatedAt">) {
    const doc = await ConversationAnalyticsModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), conversationId: objectIdOrThrow(input.conversationId) },
      {
        ...input,
        organizationId: objectIdOrThrow(input.organizationId),
        conversationId: objectIdOrThrow(input.conversationId),
        agentSessionId: objectId(input.agentSessionId),
        leadId: objectId(input.leadId),
        callId: objectId(input.callId),
      },
      { new: true, upsert: true },
    ).lean();
    return toConversationAnalytics(doc as AnyDoc);
  }
}

export class MongoAgentPerformanceRepository implements AgentPerformanceRepository {
  async listByOrganization(organizationId: string) {
    const docs = await AgentPerformanceModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ callsHandled: -1, averageQaScore: -1 })
      .lean();
    return docs.map((doc) => toAgentPerformance(doc as AnyDoc));
  }

  async upsert(input: Omit<AgentPerformance, "id" | "createdAt" | "updatedAt">) {
    const doc = await AgentPerformanceModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), agentId: objectIdOrThrow(input.agentId) },
      { ...input, organizationId: objectIdOrThrow(input.organizationId), agentId: objectIdOrThrow(input.agentId) },
      { new: true, upsert: true },
    ).lean();
    return toAgentPerformance(doc as AnyDoc);
  }
}

export class MongoQueueAnalyticsRepository implements QueueAnalyticsRepository {
  async listByOrganization(organizationId: string) {
    const docs = await QueueAnalyticsModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ computedAt: -1 })
      .lean();
    return docs.map((doc) => toQueueAnalytics(doc as AnyDoc));
  }

  async upsert(input: Omit<QueueAnalytics, "id" | "createdAt" | "updatedAt">) {
    const doc = await QueueAnalyticsModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), queueId: objectIdOrThrow(input.queueId) },
      { ...input, organizationId: objectIdOrThrow(input.organizationId), queueId: objectIdOrThrow(input.queueId) },
      { new: true, upsert: true },
    ).lean();
    return toQueueAnalytics(doc as AnyDoc);
  }
}

export class MongoCallOutcomeRepository implements CallOutcomeRepository {
  async listByOrganization(organizationId: string) {
    const docs = await CallOutcomeModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ occurredAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toCallOutcome(doc as AnyDoc));
  }

  async upsert(input: Omit<CallOutcome, "id" | "createdAt" | "updatedAt">) {
    const filter =
      input.conversationId
        ? { organizationId: objectIdOrThrow(input.organizationId), conversationId: objectIdOrThrow(input.conversationId) }
        : { organizationId: objectIdOrThrow(input.organizationId), callId: objectId(input.callId), outcome: input.outcome };
    const doc = await CallOutcomeModel.findOneAndUpdate(
      filter,
      {
        ...input,
        organizationId: objectIdOrThrow(input.organizationId),
        conversationId: objectId(input.conversationId),
        agentSessionId: objectId(input.agentSessionId),
        leadId: objectId(input.leadId),
        callId: objectId(input.callId),
      },
      { new: true, upsert: true },
    ).lean();
    return toCallOutcome(doc as AnyDoc);
  }
}

export class MongoQualityScoreRepository implements QualityScoreRepository {
  async listByOrganization(organizationId: string) {
    const docs = await QualityScoreModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toQualityScore(doc as AnyDoc));
  }

  async upsert(input: Omit<QualityScore, "id" | "createdAt" | "updatedAt">) {
    const doc = await QualityScoreModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), conversationId: objectIdOrThrow(input.conversationId) },
      {
        ...input,
        organizationId: objectIdOrThrow(input.organizationId),
        conversationId: objectIdOrThrow(input.conversationId),
        agentSessionId: objectId(input.agentSessionId),
      },
      { new: true, upsert: true },
    ).lean();
    return toQualityScore(doc as AnyDoc);
  }
}

export class MongoSentimentAnalysisRepository implements SentimentAnalysisRepository {
  async listByOrganization(organizationId: string) {
    const docs = await SentimentAnalysisModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toSentimentAnalysis(doc as AnyDoc));
  }

  async upsert(input: Omit<SentimentAnalysis, "id" | "createdAt" | "updatedAt">) {
    const doc = await SentimentAnalysisModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), conversationId: objectIdOrThrow(input.conversationId) },
      {
        ...input,
        organizationId: objectIdOrThrow(input.organizationId),
        conversationId: objectIdOrThrow(input.conversationId),
        agentSessionId: objectId(input.agentSessionId),
      },
      { new: true, upsert: true },
    ).lean();
    return toSentimentAnalysis(doc as AnyDoc);
  }
}
