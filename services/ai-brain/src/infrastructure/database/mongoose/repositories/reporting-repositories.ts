import type {
  BenchmarkMetricRepository,
  BusinessInsightRepository,
  ExecutiveDashboardRepository,
  ExecutiveSummaryRepository,
  GeneratedReportRepository,
  KpiMetricRepository,
  ReportExportRepository,
  ReportTemplateRepository,
  ScheduledReportRepository,
  TrendAnalysisRepository,
} from "../../../../application/ports.js";
import type { BenchmarkMetric } from "../../../../domain/entities/benchmark-metric.js";
import type { BusinessInsight } from "../../../../domain/entities/business-insight.js";
import type { ExecutiveDashboard } from "../../../../domain/entities/executive-dashboard.js";
import type { ExecutiveSummary } from "../../../../domain/entities/executive-summary.js";
import type { GeneratedReport } from "../../../../domain/entities/generated-report.js";
import type { KpiMetric } from "../../../../domain/entities/kpi-metric.js";
import type { ReportExport } from "../../../../domain/entities/report-export.js";
import type { ReportTemplate } from "../../../../domain/entities/report-template.js";
import type { ScheduledReport } from "../../../../domain/entities/scheduled-report.js";
import type { TrendAnalysis } from "../../../../domain/entities/trend-analysis.js";
import { BenchmarkMetricModel } from "../models/benchmark-metric-model.js";
import { BusinessInsightModel } from "../models/business-insight-model.js";
import { ExecutiveDashboardModel } from "../models/executive-dashboard-model.js";
import { ExecutiveSummaryModel } from "../models/executive-summary-model.js";
import { GeneratedReportModel } from "../models/generated-report-model.js";
import { KpiMetricModel } from "../models/kpi-metric-model.js";
import { ReportExportModel } from "../models/report-export-model.js";
import { ReportTemplateModel } from "../models/report-template-model.js";
import { ScheduledReportModel } from "../models/scheduled-report-model.js";
import { TrendAnalysisModel } from "../models/trend-analysis-model.js";
import {
  toBenchmarkMetric,
  toBusinessInsight,
  toExecutiveDashboard,
  toExecutiveSummary,
  toGeneratedReport,
  toKpiMetric,
  toReportExport,
  toReportTemplate,
  toScheduledReport,
  toTrendAnalysis,
} from "./mappers.js";
import { objectId, objectIdOrThrow } from "./repository-utils.js";

type AnyDoc = Record<string, unknown> & { _id: { toString(): string } };
const newest = { createdAt: -1 } as const;

export class MongoReportTemplateRepository implements ReportTemplateRepository {
  async create(input: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">): Promise<ReportTemplate> {
    const doc = await ReportTemplateModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId), createdBy: objectId(input.createdBy) });
    return toReportTemplate(doc.toObject() as AnyDoc);
  }

  async update(id: string, organizationId: string, patch: Partial<Omit<ReportTemplate, "id" | "organizationId" | "createdAt" | "updatedAt">>): Promise<ReportTemplate | null> {
    const doc = await ReportTemplateModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { $set: { ...patch, createdBy: patch.createdBy === undefined ? undefined : objectId(patch.createdBy) } },
      { new: true },
    ).lean();
    return doc ? toReportTemplate(doc as AnyDoc) : null;
  }

  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await ReportTemplateModel.deleteOne({ _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) });
    return result.deletedCount === 1;
  }

  async listByOrganization(organizationId: string): Promise<ReportTemplate[]> {
    const docs = await ReportTemplateModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort(newest).limit(200).lean();
    return docs.map((doc) => toReportTemplate(doc as AnyDoc));
  }
}

export class MongoScheduledReportRepository implements ScheduledReportRepository {
  async create(input: Omit<ScheduledReport, "id" | "createdAt" | "updatedAt">): Promise<ScheduledReport> {
    const doc = await ScheduledReportModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId), templateId: objectId(input.templateId) });
    return toScheduledReport(doc.toObject() as AnyDoc);
  }

  async update(id: string, organizationId: string, patch: Partial<Omit<ScheduledReport, "id" | "organizationId" | "createdAt" | "updatedAt">>): Promise<ScheduledReport | null> {
    const doc = await ScheduledReportModel.findOneAndUpdate(
      { _id: objectIdOrThrow(id), organizationId: objectIdOrThrow(organizationId) },
      { $set: { ...patch, templateId: patch.templateId === undefined ? undefined : objectId(patch.templateId) } },
      { new: true },
    ).lean();
    return doc ? toScheduledReport(doc as AnyDoc) : null;
  }

  async listByOrganization(organizationId: string): Promise<ScheduledReport[]> {
    const docs = await ScheduledReportModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ nextRunAt: 1 }).limit(200).lean();
    return docs.map((doc) => toScheduledReport(doc as AnyDoc));
  }
}

export class MongoGeneratedReportRepository implements GeneratedReportRepository {
  async create(input: Omit<GeneratedReport, "id" | "createdAt" | "updatedAt">): Promise<GeneratedReport> {
    const doc = await GeneratedReportModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      templateId: objectId(input.templateId),
      scheduledReportId: objectId(input.scheduledReportId),
    });
    return toGeneratedReport(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<GeneratedReport[]> {
    const docs = await GeneratedReportModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ generatedAt: -1 }).limit(200).lean();
    return docs.map((doc) => toGeneratedReport(doc as AnyDoc));
  }
}

export class MongoExecutiveDashboardRepository implements ExecutiveDashboardRepository {
  async upsert(input: Omit<ExecutiveDashboard, "id" | "createdAt" | "updatedAt">): Promise<ExecutiveDashboard> {
    const doc = await ExecutiveDashboardModel.findOneAndUpdate(
      { organizationId: objectIdOrThrow(input.organizationId) },
      { $set: { ...input, organizationId: objectIdOrThrow(input.organizationId) } },
      { new: true, upsert: true },
    ).lean();
    return toExecutiveDashboard(doc as AnyDoc);
  }

  async latest(organizationId: string): Promise<ExecutiveDashboard | null> {
    const doc = await ExecutiveDashboardModel.findOne({ organizationId: objectIdOrThrow(organizationId) }).sort({ computedAt: -1 }).lean();
    return doc ? toExecutiveDashboard(doc as AnyDoc) : null;
  }
}

export class MongoKpiMetricRepository implements KpiMetricRepository {
  async create(input: Omit<KpiMetric, "id" | "createdAt" | "updatedAt">): Promise<KpiMetric> {
    const doc = await KpiMetricModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toKpiMetric(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<KpiMetric[]> {
    const docs = await KpiMetricModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ measuredAt: -1 }).limit(300).lean();
    return docs.map((doc) => toKpiMetric(doc as AnyDoc));
  }
}

export class MongoTrendAnalysisRepository implements TrendAnalysisRepository {
  async create(input: Omit<TrendAnalysis, "id" | "createdAt" | "updatedAt">): Promise<TrendAnalysis> {
    const doc = await TrendAnalysisModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toTrendAnalysis(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<TrendAnalysis[]> {
    const docs = await TrendAnalysisModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ computedAt: -1 }).limit(200).lean();
    return docs.map((doc) => toTrendAnalysis(doc as AnyDoc));
  }
}

export class MongoBenchmarkMetricRepository implements BenchmarkMetricRepository {
  async create(input: Omit<BenchmarkMetric, "id" | "createdAt" | "updatedAt">): Promise<BenchmarkMetric> {
    const doc = await BenchmarkMetricModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toBenchmarkMetric(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<BenchmarkMetric[]> {
    const docs = await BenchmarkMetricModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ computedAt: -1 }).limit(200).lean();
    return docs.map((doc) => toBenchmarkMetric(doc as AnyDoc));
  }
}

export class MongoBusinessInsightRepository implements BusinessInsightRepository {
  async create(input: Omit<BusinessInsight, "id" | "createdAt" | "updatedAt">): Promise<BusinessInsight> {
    const doc = await BusinessInsightModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toBusinessInsight(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<BusinessInsight[]> {
    const docs = await BusinessInsightModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ impactScore: -1, createdAt: -1 }).limit(200).lean();
    return docs.map((doc) => toBusinessInsight(doc as AnyDoc));
  }
}

export class MongoExecutiveSummaryRepository implements ExecutiveSummaryRepository {
  async create(input: Omit<ExecutiveSummary, "id" | "createdAt" | "updatedAt">): Promise<ExecutiveSummary> {
    const doc = await ExecutiveSummaryModel.create({ ...input, organizationId: objectIdOrThrow(input.organizationId) });
    return toExecutiveSummary(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<ExecutiveSummary[]> {
    const docs = await ExecutiveSummaryModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort({ generatedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toExecutiveSummary(doc as AnyDoc));
  }
}

export class MongoReportExportRepository implements ReportExportRepository {
  async create(input: Omit<ReportExport, "id" | "createdAt" | "updatedAt">): Promise<ReportExport> {
    const doc = await ReportExportModel.create({
      ...input,
      organizationId: objectIdOrThrow(input.organizationId),
      reportId: objectId(input.reportId),
      requestedBy: objectId(input.requestedBy),
    });
    return toReportExport(doc.toObject() as AnyDoc);
  }

  async listByOrganization(organizationId: string): Promise<ReportExport[]> {
    const docs = await ReportExportModel.find({ organizationId: objectIdOrThrow(organizationId) }).sort(newest).limit(200).lean();
    return docs.map((doc) => toReportExport(doc as AnyDoc));
  }
}
