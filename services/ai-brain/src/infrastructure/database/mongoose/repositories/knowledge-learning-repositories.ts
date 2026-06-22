import type {
  KnowledgeFeedbackRepository,
  KnowledgeGapRepository,
  KnowledgeImprovementRepository,
  KnowledgeLearningEventRepository,
  KnowledgeSuggestionRepository,
} from "../../../../application/ports.js";
import type { KnowledgeFeedback } from "../../../../domain/entities/knowledge-feedback.js";
import type { KnowledgeGap } from "../../../../domain/entities/knowledge-gap.js";
import type { KnowledgeImprovement } from "../../../../domain/entities/knowledge-improvement.js";
import type { KnowledgeLearningEvent } from "../../../../domain/entities/knowledge-learning-event.js";
import type { KnowledgeSuggestion } from "../../../../domain/entities/knowledge-suggestion.js";
import { KnowledgeFeedbackModel } from "../models/knowledge-feedback-model.js";
import { KnowledgeGapModel } from "../models/knowledge-gap-model.js";
import { KnowledgeImprovementModel } from "../models/knowledge-improvement-model.js";
import { KnowledgeLearningEventModel } from "../models/knowledge-learning-event-model.js";
import { KnowledgeSuggestionModel } from "../models/knowledge-suggestion-model.js";
import {
  toKnowledgeFeedback,
  toKnowledgeGap,
  toKnowledgeImprovement,
  toKnowledgeLearningEvent,
  toKnowledgeSuggestion,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

export class MongoKnowledgeFeedbackRepository implements KnowledgeFeedbackRepository {
  async create(input: Omit<KnowledgeFeedback, "id">) {
    const doc = await KnowledgeFeedbackModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      searchId: objectId(input.searchId),
      citationId: objectId(input.citationId),
      conversationId: objectId(input.conversationId),
      agentSessionId: objectId(input.agentSessionId),
      chunkId: objectId(input.chunkId),
      createdBy: objectId(input.createdBy),
    });
    return toKnowledgeFeedback(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeFeedbackModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toKnowledgeFeedback(doc as AnyDoc));
  }
}

export class MongoKnowledgeGapRepository implements KnowledgeGapRepository {
  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeGapModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ severityScore: -1, updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toKnowledgeGap(doc as AnyDoc));
  }

  async upsert(input: Omit<KnowledgeGap, "id" | "createdAt" | "updatedAt">) {
    const doc = await KnowledgeGapModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), topic: input.topic },
      {
        ...input,
        organizationId: objectIdOrThrow(input.organizationId),
        sourceSearchIds: input.sourceSearchIds.map(objectIdOrThrow),
        sourceConversationIds: input.sourceConversationIds.map(objectIdOrThrow),
      },
      { new: true, upsert: true },
    ).lean();
    return toKnowledgeGap(doc as AnyDoc);
  }
}

export class MongoKnowledgeSuggestionRepository implements KnowledgeSuggestionRepository {
  async create(input: Omit<KnowledgeSuggestion, "id" | "createdAt" | "updatedAt">) {
    const doc = await KnowledgeSuggestionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      gapId: objectId(input.gapId),
      reviewedBy: objectId(input.reviewedBy),
    });
    return toKnowledgeSuggestion(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeSuggestionModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toKnowledgeSuggestion(doc as AnyDoc));
  }

  async updateStatus(id: string, organizationId: string, input: Pick<KnowledgeSuggestion, "status" | "reviewedBy" | "reviewedAt">) {
    const doc = await KnowledgeSuggestionModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { ...input, reviewedBy: objectId(input.reviewedBy) },
      { new: true },
    ).lean();
    return doc ? toKnowledgeSuggestion(doc as AnyDoc) : null;
  }
}

export class MongoKnowledgeLearningEventRepository implements KnowledgeLearningEventRepository {
  async create(input: Omit<KnowledgeLearningEvent, "id">) {
    const doc = await KnowledgeLearningEventModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      sourceConversationId: objectId(input.sourceConversationId),
      sourceSessionId: objectId(input.sourceSessionId),
      searchId: objectId(input.searchId),
    });
    return toKnowledgeLearningEvent(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeLearningEventModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return docs.map((doc) => toKnowledgeLearningEvent(doc as AnyDoc));
  }
}

export class MongoKnowledgeImprovementRepository implements KnowledgeImprovementRepository {
  async create(input: Omit<KnowledgeImprovement, "id" | "createdAt">) {
    const doc = await KnowledgeImprovementModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
    });
    return toKnowledgeImprovement(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string) {
    const docs = await KnowledgeImprovementModel.find({ organizationId: objectIdOrThrow(organizationId) })
      .sort({ computedAt: -1 })
      .limit(100)
      .lean();
    return docs.map((doc) => toKnowledgeImprovement(doc as AnyDoc));
  }
}
