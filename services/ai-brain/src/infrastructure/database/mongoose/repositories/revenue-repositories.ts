import type {
  CrossSellOpportunityRepository,
  DealRiskRepository,
  DealStageRepository,
  OpportunityRepository,
  RevenueForecastRepository,
  SalesInsightRepository,
  UpsellOpportunityRepository,
  WinLossAnalysisRepository,
} from "../../../../application/ports.js";
import type { CrossSellOpportunity } from "../../../../domain/entities/cross-sell-opportunity.js";
import type { DealRisk } from "../../../../domain/entities/deal-risk.js";
import type { DealStage } from "../../../../domain/entities/deal-stage.js";
import type { Opportunity } from "../../../../domain/entities/opportunity.js";
import type { RevenueForecast } from "../../../../domain/entities/revenue-forecast.js";
import type { SalesInsight } from "../../../../domain/entities/sales-insight.js";
import type { UpsellOpportunity } from "../../../../domain/entities/upsell-opportunity.js";
import type { WinLossAnalysis } from "../../../../domain/entities/win-loss-analysis.js";
import { CrossSellOpportunityModel } from "../models/cross-sell-opportunity-model.js";
import { DealRiskModel } from "../models/deal-risk-model.js";
import { DealStageModel } from "../models/deal-stage-model.js";
import { OpportunityModel } from "../models/opportunity-model.js";
import { RevenueForecastModel } from "../models/revenue-forecast-model.js";
import { SalesInsightModel } from "../models/sales-insight-model.js";
import { UpsellOpportunityModel } from "../models/upsell-opportunity-model.js";
import { WinLossAnalysisModel } from "../models/win-loss-analysis-model.js";
import {
  toCrossSellOpportunity,
  toDealRisk,
  toDealStage,
  toOpportunity,
  toRevenueForecast,
  toSalesInsight,
  toUpsellOpportunity,
  toWinLossAnalysis,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };

const newest = { updatedAt: -1 } as const;
const newestCreated = { createdAt: -1 } as const;

export class MongoOpportunityRepository implements OpportunityRepository {
  async create(input: Omit<Opportunity, "id" | "createdAt" | "updatedAt">): Promise<Opportunity> {
    const doc = await OpportunityModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      leadId: objectId(input.leadId),
      stageId: objectId(input.stageId),
      ownerId: objectId(input.ownerId),
    });
    return toOpportunity(doc.toObject() as AnyDoc);
  }

  async update(
    id: string,
    organizationId: string,
    patch: Partial<Omit<Opportunity, "id" | "organizationId" | "createdAt" | "updatedAt">>,
  ): Promise<Opportunity | null> {
    const doc = await OpportunityModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      {
        $set: {
          ...patch,
          leadId: patch.leadId === undefined ? undefined : objectId(patch.leadId),
          stageId: patch.stageId === undefined ? undefined : objectId(patch.stageId),
          ownerId: patch.ownerId === undefined ? undefined : objectId(patch.ownerId),
        },
      },
      { new: true },
    ).lean();
    return doc ? toOpportunity(doc as AnyDoc) : null;
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await OpportunityModel.deleteOne({ _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) });
    return result.deletedCount === 1;
  }

  async findById(id: string): Promise<Opportunity | null> {
    const doc = await OpportunityModel.findById(id).lean();
    return doc ? toOpportunity(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<Opportunity[]> {
    const docs = await OpportunityModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort(newest).limit(500).lean();
    return docs.map((doc) => toOpportunity(doc as AnyDoc));
  }

  async listOpenByOrganization(organizationId: string): Promise<Opportunity[]> {
    const docs = await OpportunityModel.find({ organizationId: objectIdOrThrow(organizationId), status: "OPEN" })
      .sort({ expectedCloseDate: 1, value: -1 })
      .limit(500)
      .lean();
    return docs.map((doc) => toOpportunity(doc as AnyDoc));
  }

  async listClosingBetween(organizationId: string, start: Date, end: Date): Promise<Opportunity[]> {
    const docs = await OpportunityModel.find({
      organizationId: objectIdOrThrow(organizationId),
      status: "OPEN",
      expectedCloseDate: { $gte: start, $lte: end },
    })
      .sort({ expectedCloseDate: 1 })
      .limit(500)
      .lean();
    return docs.map((doc) => toOpportunity(doc as AnyDoc));
  }
}

export class MongoDealStageRepository implements DealStageRepository {
  async create(input: Omit<DealStage, "id" | "createdAt" | "updatedAt">): Promise<DealStage> {
    const doc = await DealStageModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toDealStage(doc.toObject() as AnyDoc);
  }

  async update(
    id: string,
    organizationId: string,
    patch: Partial<Omit<DealStage, "id" | "organizationId" | "createdAt" | "updatedAt">>,
  ): Promise<DealStage | null> {
    const doc = await DealStageModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { $set: patch },
      { new: true },
    ).lean();
    return doc ? toDealStage(doc as AnyDoc) : null;
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await DealStageModel.deleteOne({ _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) });
    return result.deletedCount === 1;
  }

  async findById(id: string): Promise<DealStage | null> {
    const doc = await DealStageModel.findById(id).lean();
    return doc ? toDealStage(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<DealStage[]> {
    const docs = await DealStageModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ order: 1 }).lean();
    return docs.map((doc) => toDealStage(doc as AnyDoc));
  }
}

export class MongoRevenueForecastRepository implements RevenueForecastRepository {
  async create(input: Omit<RevenueForecast, "id" | "createdAt" | "updatedAt">): Promise<RevenueForecast> {
    const doc = await RevenueForecastModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toRevenueForecast(doc.toObject() as AnyDoc);
  }

  async upsert(input: Omit<RevenueForecast, "id" | "createdAt" | "updatedAt">): Promise<RevenueForecast> {
    const doc = await RevenueForecastModel.findOneAndUpdate(
      {
        organizationId: objectIdOrThrow(input.organizationId),
        period: input.period,
        periodStart: input.periodStart,
      },
      { $set: { ...input, organizationId: objectIdOrThrow(input.organizationId) } },
      { new: true, upsert: true },
    ).lean();
    return toRevenueForecast(doc as AnyDoc);
  }

  async findLatest(organizationId: string, period: RevenueForecast["period"]): Promise<RevenueForecast | null> {
    const doc = await RevenueForecastModel.findOne({ organizationId: objectIdOrThrow(organizationId), period })
      .sort({ periodStart: -1 })
      .lean();
    return doc ? toRevenueForecast(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<RevenueForecast[]> {
    const docs = await RevenueForecastModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ periodStart: -1 }).limit(120).lean();
    return docs.map((doc) => toRevenueForecast(doc as AnyDoc));
  }
}

export class MongoDealRiskRepository implements DealRiskRepository {
  async create(input: Omit<DealRisk, "id" | "createdAt" | "updatedAt">): Promise<DealRisk> {
    const doc = await DealRiskModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      opportunityId: objectIdOrThrow(input.opportunityId),
    });
    return toDealRisk(doc.toObject() as AnyDoc);
  }

  async update(
    id: string,
    organizationId: string,
    patch: Partial<Omit<DealRisk, "id" | "organizationId" | "createdAt" | "updatedAt">>,
  ): Promise<DealRisk | null> {
    const doc = await DealRiskModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { $set: patch },
      { new: true },
    ).lean();
    return doc ? toDealRisk(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<DealRisk[]> {
    const docs = await DealRiskModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ riskScore: -1, detectedAt: -1 }).limit(500).lean();
    return docs.map((doc) => toDealRisk(doc as AnyDoc));
  }

  async listActiveByOrganization(organizationId: string): Promise<DealRisk[]> {
    const docs = await DealRiskModel.find({ organizationId: objectIdOrThrow(organizationId), active: true }).sort({ riskScore: -1 }).limit(300).lean();
    return docs.map((doc) => toDealRisk(doc as AnyDoc));
  }
}

export class MongoWinLossAnalysisRepository implements WinLossAnalysisRepository {
  async create(input: Omit<WinLossAnalysis, "id" | "createdAt" | "updatedAt">): Promise<WinLossAnalysis> {
    const doc = await WinLossAnalysisModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      opportunityId: objectIdOrThrow(input.opportunityId),
    });
    return toWinLossAnalysis(doc.toObject() as AnyDoc);
  }

  async upsert(input: Omit<WinLossAnalysis, "id" | "createdAt" | "updatedAt">): Promise<WinLossAnalysis> {
    const doc = await WinLossAnalysisModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId), opportunityId: objectIdOrThrow(input.opportunityId) },
      {
        $set: {
          ...input,
          organizationId: objectIdOrThrow(input.organizationId),
          opportunityId: objectIdOrThrow(input.opportunityId),
        },
      },
      { new: true, upsert: true },
    ).lean();
    return toWinLossAnalysis(doc as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<WinLossAnalysis[]> {
    const docs = await WinLossAnalysisModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ analyzedAt: -1 }).limit(500).lean();
    return docs.map((doc) => toWinLossAnalysis(doc as AnyDoc));
  }
}

export class MongoSalesInsightRepository implements SalesInsightRepository {
  async create(input: Omit<SalesInsight, "id" | "createdAt" | "updatedAt">): Promise<SalesInsight> {
    const doc = await SalesInsightModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toSalesInsight(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<SalesInsight[]> {
    const docs = await SalesInsightModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort(newestCreated).limit(200).lean();
    return docs.map((doc) => toSalesInsight(doc as AnyDoc));
  }
}

export class MongoUpsellOpportunityRepository implements UpsellOpportunityRepository {
  async create(input: Omit<UpsellOpportunity, "id" | "createdAt" | "updatedAt">): Promise<UpsellOpportunity> {
    const doc = await UpsellOpportunityModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      customerId: objectId(input.customerId),
      opportunityId: objectId(input.opportunityId),
    });
    return toUpsellOpportunity(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<UpsellOpportunity[]> {
    const docs = await UpsellOpportunityModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ fitScore: -1, createdAt: -1 }).limit(300).lean();
    return docs.map((doc) => toUpsellOpportunity(doc as AnyDoc));
  }
}

export class MongoCrossSellOpportunityRepository implements CrossSellOpportunityRepository {
  async create(input: Omit<CrossSellOpportunity, "id" | "createdAt" | "updatedAt">): Promise<CrossSellOpportunity> {
    const doc = await CrossSellOpportunityModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      customerId: objectId(input.customerId),
      opportunityId: objectId(input.opportunityId),
    });
    return toCrossSellOpportunity(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<CrossSellOpportunity[]> {
    const docs = await CrossSellOpportunityModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ affinityScore: -1, createdAt: -1 }).limit(300).lean();
    return docs.map((doc) => toCrossSellOpportunity(doc as AnyDoc));
  }
}
