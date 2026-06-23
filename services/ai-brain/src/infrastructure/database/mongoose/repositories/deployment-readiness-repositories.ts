import type {
  BackupJob,
  BackupSnapshot,
  ConfigurationIssue,
  DeploymentEnvironment,
  DeploymentEvent,
  DeploymentTarget,
  DisasterRecoveryPlan,
  EnvironmentValidation,
  LaunchStatus,
  RecoveryPlan,
  ReleaseChecklist,
  ReleaseReadiness,
  SecurityFinding,
  StartupCheck,
} from "../../../../domain/entities/deployment-readiness.js";
import type {
  BackupJobRepository,
  BackupSnapshotRepository,
  ConfigurationIssueRepository,
  DeploymentEnvironmentRepository,
  DeploymentEventRepository,
  DeploymentTargetRepository,
  DisasterRecoveryPlanRepository,
  EnvironmentValidationRepository,
  LaunchStatusRepository,
  RecoveryPlanRepository,
  ReleaseChecklistRepository,
  ReleaseReadinessRepository,
  SecurityFindingRepository,
  StartupCheckRepository,
} from "../../../../application/ports.js";
import {
  BackupJobModel,
  BackupSnapshotModel,
  ConfigurationIssueModel,
  DeploymentEnvironmentModel,
  DeploymentEventModel,
  DeploymentTargetModel,
  DisasterRecoveryPlanModel,
  EnvironmentValidationModel,
  LaunchStatusModel,
  RecoveryPlanModel,
  ReleaseChecklistModel,
  ReleaseReadinessModel,
  SecurityFindingModel,
  StartupCheckModel,
} from "../models/deployment-readiness-models.js";
import { objectId } from "./repository-utils.js";

type Doc = Record<string, any>;
type Mapper<T> = (doc: Doc) => T;

const maybeOrganization = (organizationId?: string | null) => (organizationId ? { organizationId: objectId(organizationId) } : {});
const nullableOrganization = (organizationId?: string | null) => (organizationId ? objectId(organizationId) : null);
const asId = (value: unknown): string | null => (value ? String(value) : null);
const asDate = (value: unknown): Date => (value instanceof Date ? value : new Date(String(value)));
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const one = (doc: Doc | Doc[] | null, label: string): Doc => {
  if (!doc || Array.isArray(doc)) {
    throw new Error(`${label} did not return a document`);
  }
  return doc;
};

const common = (doc: Doc) => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toDeploymentEnvironment = (doc: Doc): DeploymentEnvironment => ({
  ...common(doc),
  name: String(doc.name),
  type: doc.type,
  region: String(doc.region),
  active: Boolean(doc.active),
});

const toDeploymentTarget = (doc: Doc): DeploymentTarget => ({
  ...common(doc),
  environmentId: asId(doc.environmentId),
  service: doc.service,
  version: String(doc.version),
  status: doc.status,
  url: doc.url ?? null,
});

const toEnvironmentValidation = (doc: Doc): EnvironmentValidation => ({
  ...common(doc),
  environmentId: asId(doc.environmentId),
  key: String(doc.key),
  valid: Boolean(doc.valid),
  severity: doc.severity,
  message: String(doc.message),
  checkedAt: asDate(doc.checkedAt),
});

const toStartupCheck = (doc: Doc): StartupCheck => ({
  ...common(doc),
  service: doc.service,
  status: doc.status,
  latencyMs: Number(doc.latencyMs ?? 0),
  message: String(doc.message),
  checkedAt: asDate(doc.checkedAt),
});

const toConfigurationIssue = (doc: Doc): ConfigurationIssue => ({
  ...common(doc),
  key: String(doc.key),
  issueType: doc.issueType,
  severity: doc.severity,
  message: String(doc.message),
  resolved: Boolean(doc.resolved),
});

const toSecurityFinding = (doc: Doc): SecurityFinding => ({
  ...common(doc),
  category: doc.category,
  severity: doc.severity,
  title: String(doc.title),
  description: String(doc.description),
  resolved: Boolean(doc.resolved),
});

const toBackupJob = (doc: Doc): BackupJob => ({
  ...common(doc),
  name: String(doc.name),
  schedule: String(doc.schedule),
  target: doc.target,
  enabled: Boolean(doc.enabled),
  lastRunAt: doc.lastRunAt ? asDate(doc.lastRunAt) : null,
  nextRunAt: doc.nextRunAt ? asDate(doc.nextRunAt) : null,
});

const toBackupSnapshot = (doc: Doc): BackupSnapshot => ({
  ...common(doc),
  jobId: asId(doc.jobId),
  target: doc.target,
  status: doc.status,
  sizeBytes: Number(doc.sizeBytes ?? 0),
  location: doc.location ?? null,
  capturedAt: asDate(doc.capturedAt),
});

const toRecoveryPlan = (doc: Doc): RecoveryPlan => ({
  ...common(doc),
  name: String(doc.name),
  objective: String(doc.objective),
  rtoMinutes: Number(doc.rtoMinutes ?? 60),
  rpoMinutes: Number(doc.rpoMinutes ?? 15),
  status: doc.status,
  steps: Array.isArray(doc.steps) ? doc.steps.map(String) : [],
});

const toDisasterRecoveryPlan = (doc: Doc): DisasterRecoveryPlan => ({
  ...common(doc),
  name: String(doc.name),
  failoverRegion: String(doc.failoverRegion),
  failoverReady: Boolean(doc.failoverReady),
  recoveryReady: Boolean(doc.recoveryReady),
  continuityStatus: doc.continuityStatus,
  lastTestedAt: doc.lastTestedAt ? asDate(doc.lastTestedAt) : null,
});

const toReleaseChecklist = (doc: Doc): ReleaseChecklist => ({
  ...common(doc),
  name: String(doc.name),
  required: Boolean(doc.required),
  completed: Boolean(doc.completed),
  owner: doc.owner ?? null,
  dueAt: doc.dueAt ? asDate(doc.dueAt) : null,
});

const toReleaseReadiness = (doc: Doc): ReleaseReadiness => ({
  ...common(doc),
  readinessScore: Number(doc.readinessScore ?? 0),
  status: doc.status,
  blockers: Array.isArray(doc.blockers) ? doc.blockers.map(String) : [],
  recommendation: doc.recommendation,
  evaluatedAt: asDate(doc.evaluatedAt),
});

const toDeploymentEvent = (doc: Doc): DeploymentEvent => ({
  ...common(doc),
  environmentId: asId(doc.environmentId),
  eventType: doc.eventType,
  service: doc.service,
  status: doc.status,
  message: String(doc.message),
  occurredAt: asDate(doc.occurredAt),
});

const toLaunchStatus = (doc: Doc): LaunchStatus => ({
  ...common(doc),
  state: doc.state,
  goNoGo: doc.goNoGo,
  finalReadinessScore: Number(doc.finalReadinessScore ?? 0),
  message: String(doc.message ?? ""),
  updatedBy: doc.updatedBy ?? null,
});

class ListCreateRepository<T> {
  constructor(
    private readonly model: { create(input: Record<string, unknown>): Promise<Doc>; find(filter: Record<string, unknown>): any },
    private readonly mapper: Mapper<T>,
    private readonly sort: Record<string, 1 | -1> = { createdAt: -1 },
  ) {}

  async create(input: Record<string, unknown>): Promise<T> {
    return this.mapper(await this.model.create({ ...input, organizationId: nullableOrganization(input.organizationId as string | null | undefined) }));
  }

  async list(organizationId?: string | null): Promise<T[]> {
    const docs = await this.model.find(maybeOrganization(organizationId)).sort(this.sort).lean();
    return docs.map(this.mapper);
  }
}

export class MongoDeploymentEnvironmentRepository extends ListCreateRepository<DeploymentEnvironment> implements DeploymentEnvironmentRepository {
  constructor() { super(DeploymentEnvironmentModel, toDeploymentEnvironment); }
}
export class MongoDeploymentTargetRepository extends ListCreateRepository<DeploymentTarget> implements DeploymentTargetRepository {
  constructor() { super(DeploymentTargetModel, toDeploymentTarget); }
}
export class MongoEnvironmentValidationRepository extends ListCreateRepository<EnvironmentValidation> implements EnvironmentValidationRepository {
  constructor() { super(EnvironmentValidationModel, toEnvironmentValidation, { checkedAt: -1 }); }
}
export class MongoStartupCheckRepository extends ListCreateRepository<StartupCheck> implements StartupCheckRepository {
  constructor() { super(StartupCheckModel, toStartupCheck, { checkedAt: -1 }); }
}
export class MongoConfigurationIssueRepository extends ListCreateRepository<ConfigurationIssue> implements ConfigurationIssueRepository {
  constructor() { super(ConfigurationIssueModel, toConfigurationIssue); }
}
export class MongoSecurityFindingRepository extends ListCreateRepository<SecurityFinding> implements SecurityFindingRepository {
  constructor() { super(SecurityFindingModel, toSecurityFinding); }
}
export class MongoBackupJobRepository extends ListCreateRepository<BackupJob> implements BackupJobRepository {
  constructor() { super(BackupJobModel, toBackupJob); }
}
export class MongoBackupSnapshotRepository extends ListCreateRepository<BackupSnapshot> implements BackupSnapshotRepository {
  constructor() { super(BackupSnapshotModel, toBackupSnapshot, { capturedAt: -1 }); }
}
export class MongoRecoveryPlanRepository extends ListCreateRepository<RecoveryPlan> implements RecoveryPlanRepository {
  constructor() { super(RecoveryPlanModel, toRecoveryPlan); }
}
export class MongoDisasterRecoveryPlanRepository extends ListCreateRepository<DisasterRecoveryPlan> implements DisasterRecoveryPlanRepository {
  constructor() { super(DisasterRecoveryPlanModel, toDisasterRecoveryPlan); }
}
export class MongoReleaseChecklistRepository extends ListCreateRepository<ReleaseChecklist> implements ReleaseChecklistRepository {
  constructor() { super(ReleaseChecklistModel, toReleaseChecklist); }
}
export class MongoDeploymentEventRepository extends ListCreateRepository<DeploymentEvent> implements DeploymentEventRepository {
  constructor() { super(DeploymentEventModel, toDeploymentEvent, { occurredAt: -1 }); }
}

export class MongoReleaseReadinessRepository implements ReleaseReadinessRepository {
  async create(input: Omit<ReleaseReadiness, "id" | "createdAt" | "updatedAt">): Promise<ReleaseReadiness> {
    return toReleaseReadiness(await ReleaseReadinessModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }

  async latest(organizationId?: string | null): Promise<ReleaseReadiness | null> {
    const doc = await ReleaseReadinessModel.findOne(maybeOrganization(organizationId)).sort({ evaluatedAt: -1 }).lean();
    return doc ? toReleaseReadiness(doc) : null;
  }
}

export class MongoLaunchStatusRepository implements LaunchStatusRepository {
  async upsert(input: Omit<LaunchStatus, "id" | "createdAt" | "updatedAt">): Promise<LaunchStatus> {
    const doc = await LaunchStatusModel.findOneAndUpdate(
      { organizationId: nullableOrganization(input.organizationId) },
      { $set: { ...input, organizationId: nullableOrganization(input.organizationId) } },
      { new: true, upsert: true },
    ).lean();
    return toLaunchStatus(one(doc, "Launch status upsert"));
  }

  async latest(organizationId?: string | null): Promise<LaunchStatus | null> {
    const doc = await LaunchStatusModel.findOne(maybeOrganization(organizationId)).sort({ updatedAt: -1 }).lean();
    return doc ? toLaunchStatus(doc) : null;
  }
}
