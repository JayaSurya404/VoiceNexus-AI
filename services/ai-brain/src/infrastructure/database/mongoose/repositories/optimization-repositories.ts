import type {
  OptimizationActionRepository,
  OptimizationEventRepository,
  OptimizationExperimentRepository,
  OptimizationGoalRepository,
  OptimizationMetricRepository,
  OptimizationRecommendationRepository,
  OptimizationResultRepository,
  OptimizationRuleRepository,
} from "../../../../application/ports.js";
import type { OptimizationAction } from "../../../../domain/entities/optimization-action.js";
import type { OptimizationEvent } from "../../../../domain/entities/optimization-event.js";
import type { OptimizationExperiment } from "../../../../domain/entities/optimization-experiment.js";
import type { OptimizationGoal } from "../../../../domain/entities/optimization-goal.js";
import type { OptimizationMetric } from "../../../../domain/entities/optimization-metric.js";
import type { OptimizationRecommendation } from "../../../../domain/entities/optimization-recommendation.js";
import type { OptimizationResult } from "../../../../domain/entities/optimization-result.js";
import type { OptimizationRule } from "../../../../domain/entities/optimization-rule.js";
import { OptimizationActionModel } from "../models/optimization-action-model.js";
import { OptimizationEventModel } from "../models/optimization-event-model.js";
import { OptimizationExperimentModel } from "../models/optimization-experiment-model.js";
import { OptimizationGoalModel } from "../models/optimization-goal-model.js";
import { OptimizationMetricModel } from "../models/optimization-metric-model.js";
import { OptimizationRecommendationModel } from "../models/optimization-recommendation-model.js";
import { OptimizationResultModel } from "../models/optimization-result-model.js";
import { OptimizationRuleModel } from "../models/optimization-rule-model.js";
import {
  toOptimizationAction,
  toOptimizationEvent,
  toOptimizationExperiment,
  toOptimizationGoal,
  toOptimizationMetric,
  toOptimizationRecommendation,
  toOptimizationResult,
  toOptimizationRule,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };
const newest = { createdAt: -1 } as const;

export class MongoOptimizationRuleRepository implements OptimizationRuleRepository {
  async create(input: Omit<OptimizationRule, "id" | "createdAt" | "updatedAt">): Promise<OptimizationRule> {
    const doc = await OptimizationRuleModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toOptimizationRule(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<OptimizationRule[]> {
    const docs = await OptimizationRuleModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ priority: -1, createdAt: -1 }).limit(200).lean();
    return docs.map((doc) => toOptimizationRule(doc as AnyDoc));
  }
}

export class MongoOptimizationEventRepository implements OptimizationEventRepository {
  async create(input: Omit<OptimizationEvent, "id" | "createdAt">): Promise<OptimizationEvent> {
    const doc = await OptimizationEventModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toOptimizationEvent(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<OptimizationEvent[]> {
    const docs = await OptimizationEventModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort(newest).limit(300).lean();
    return docs.map((doc) => toOptimizationEvent(doc as AnyDoc));
  }
}

export class MongoOptimizationActionRepository implements OptimizationActionRepository {
  async create(input: Omit<OptimizationAction, "id" | "createdAt" | "updatedAt">): Promise<OptimizationAction> {
    const doc = await OptimizationActionModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      recommendationId: objectId(input.recommendationId),
    });
    return toOptimizationAction(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<OptimizationAction[]> {
    const docs = await OptimizationActionModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ impactScore: -1, createdAt: -1 }).limit(300).lean();
    return docs.map((doc) => toOptimizationAction(doc as AnyDoc));
  }
}

export class MongoOptimizationRecommendationRepository implements OptimizationRecommendationRepository {
  async create(input: Omit<OptimizationRecommendation, "id" | "createdAt" | "updatedAt">): Promise<OptimizationRecommendation> {
    const doc = await OptimizationRecommendationModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toOptimizationRecommendation(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<OptimizationRecommendation[]> {
    const docs = await OptimizationRecommendationModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ expectedImpact: -1, createdAt: -1 }).limit(300).lean();
    return docs.map((doc) => toOptimizationRecommendation(doc as AnyDoc));
  }

  async listOpenByOrganization(organizationId: string): Promise<OptimizationRecommendation[]> {
    const docs = await OptimizationRecommendationModel.find({ organizationId: objectIdOrThrow(organizationId), status: "OPEN" }).sort({ expectedImpact: -1 }).limit(200).lean();
    return docs.map((doc) => toOptimizationRecommendation(doc as AnyDoc));
  }
}

export class MongoOptimizationMetricRepository implements OptimizationMetricRepository {
  async create(input: Omit<OptimizationMetric, "id" | "createdAt" | "updatedAt">): Promise<OptimizationMetric> {
    const doc = await OptimizationMetricModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toOptimizationMetric(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<OptimizationMetric[]> {
    const docs = await OptimizationMetricModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ measuredAt: -1 }).limit(300).lean();
    return docs.map((doc) => toOptimizationMetric(doc as AnyDoc));
  }
}

export class MongoOptimizationGoalRepository implements OptimizationGoalRepository {
  async create(input: Omit<OptimizationGoal, "id" | "createdAt" | "updatedAt">): Promise<OptimizationGoal> {
    const doc = await OptimizationGoalModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toOptimizationGoal(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<OptimizationGoal[]> {
    const docs = await OptimizationGoalModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ createdAt: -1 }).limit(200).lean();
    return docs.map((doc) => toOptimizationGoal(doc as AnyDoc));
  }
}

export class MongoOptimizationExperimentRepository implements OptimizationExperimentRepository {
  async create(input: Omit<OptimizationExperiment, "id" | "createdAt" | "updatedAt">): Promise<OptimizationExperiment> {
    const doc = await OptimizationExperimentModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toOptimizationExperiment(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<OptimizationExperiment[]> {
    const docs = await OptimizationExperimentModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort(newest).limit(200).lean();
    return docs.map((doc) => toOptimizationExperiment(doc as AnyDoc));
  }
}

export class MongoOptimizationResultRepository implements OptimizationResultRepository {
  async create(input: Omit<OptimizationResult, "id" | "createdAt" | "updatedAt">): Promise<OptimizationResult> {
    const doc = await OptimizationResultModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      actionId: objectId(input.actionId),
      experimentId: objectId(input.experimentId),
    });
    return toOptimizationResult(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<OptimizationResult[]> {
    const docs = await OptimizationResultModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ capturedAt: -1 }).limit(200).lean();
    return docs.map((doc) => toOptimizationResult(doc as AnyDoc));
  }
}
