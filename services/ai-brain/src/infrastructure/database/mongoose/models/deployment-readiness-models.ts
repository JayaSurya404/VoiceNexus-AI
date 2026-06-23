import mongoose from "mongoose";

const nullableOrganizationId = { type: mongoose.Schema.Types.ObjectId, default: null, index: true };
const metadata = { type: mongoose.Schema.Types.Mixed, default: {} };

const deploymentEnvironmentSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    name: { type: String, required: true, index: true },
    type: { type: String, enum: ["DEVELOPMENT", "STAGING", "PRODUCTION"], required: true, index: true },
    region: { type: String, default: "us-east-1" },
    active: { type: Boolean, default: true, index: true },
    metadata,
  },
  { timestamps: true },
);
deploymentEnvironmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });

const deploymentTargetSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    environmentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    service: { type: String, enum: ["AI_BRAIN", "REALTIME_GATEWAY", "AUTOMATION_WORKER", "WEB", "API"], required: true, index: true },
    version: { type: String, default: "unknown" },
    status: { type: String, enum: ["PENDING", "IN_PROGRESS", "SUCCEEDED", "FAILED", "ROLLED_BACK"], default: "PENDING", index: true },
    url: { type: String, default: null },
    metadata,
  },
  { timestamps: true },
);
deploymentTargetSchema.index({ organizationId: 1, environmentId: 1, service: 1 });

const environmentValidationSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    environmentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    key: { type: String, required: true, index: true },
    valid: { type: Boolean, default: false, index: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "HIGH", index: true },
    message: { type: String, required: true },
    checkedAt: { type: Date, required: true, index: true },
    metadata,
  },
  { timestamps: true },
);
environmentValidationSchema.index({ organizationId: 1, key: 1, checkedAt: -1 });

const startupCheckSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    service: { type: String, enum: ["AI_BRAIN", "REALTIME_GATEWAY", "AUTOMATION_WORKER", "WEB", "API"], required: true, index: true },
    status: { type: String, enum: ["PASS", "WARN", "FAIL"], required: true, index: true },
    latencyMs: { type: Number, default: 0 },
    message: { type: String, required: true },
    checkedAt: { type: Date, required: true, index: true },
    metadata,
  },
  { timestamps: true },
);
startupCheckSchema.index({ organizationId: 1, service: 1, checkedAt: -1 });

const configurationIssueSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    key: { type: String, required: true, index: true },
    issueType: { type: String, enum: ["MISSING", "INVALID", "UNSAFE", "DEPRECATED"], required: true, index: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "HIGH", index: true },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false, index: true },
    metadata,
  },
  { timestamps: true },
);
configurationIssueSchema.index({ organizationId: 1, key: 1, resolved: 1 });

const securityFindingSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    category: { type: String, enum: ["SECRET", "AUTH", "NETWORK", "WEBHOOK", "CONFIGURATION"], required: true, index: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "HIGH", index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    resolved: { type: Boolean, default: false, index: true },
    metadata,
  },
  { timestamps: true },
);
securityFindingSchema.index({ organizationId: 1, severity: 1, resolved: 1 });

const backupJobSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    name: { type: String, required: true, index: true },
    schedule: { type: String, required: true },
    target: { type: String, enum: ["MONGODB", "REDIS", "FILES"], required: true, index: true },
    enabled: { type: Boolean, default: true, index: true },
    lastRunAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null, index: true },
    metadata,
  },
  { timestamps: true },
);

const backupSnapshotSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    jobId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    target: { type: String, enum: ["MONGODB", "REDIS", "FILES"], required: true, index: true },
    status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "PENDING", index: true },
    sizeBytes: { type: Number, default: 0 },
    location: { type: String, default: null },
    capturedAt: { type: Date, required: true, index: true },
    metadata,
  },
  { timestamps: true },
);

const recoveryPlanSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    name: { type: String, required: true, index: true },
    objective: { type: String, required: true },
    rtoMinutes: { type: Number, default: 60 },
    rpoMinutes: { type: Number, default: 15 },
    status: { type: String, enum: ["DRAFT", "READY", "TESTING", "FAILED"], default: "DRAFT", index: true },
    steps: { type: [String], default: [] },
    metadata,
  },
  { timestamps: true },
);

const disasterRecoveryPlanSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    name: { type: String, required: true },
    failoverRegion: { type: String, default: "us-west-2" },
    failoverReady: { type: Boolean, default: false, index: true },
    recoveryReady: { type: Boolean, default: false, index: true },
    continuityStatus: { type: String, enum: ["READY", "PARTIAL", "NOT_READY"], default: "NOT_READY", index: true },
    lastTestedAt: { type: Date, default: null },
    metadata,
  },
  { timestamps: true },
);

const releaseChecklistSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    name: { type: String, required: true, index: true },
    required: { type: Boolean, default: true, index: true },
    completed: { type: Boolean, default: false, index: true },
    owner: { type: String, default: null },
    dueAt: { type: Date, default: null },
    metadata,
  },
  { timestamps: true },
);

const releaseReadinessSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    readinessScore: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["READY", "BLOCKED", "AT_RISK"], required: true, index: true },
    blockers: { type: [String], default: [] },
    recommendation: { type: String, enum: ["GO", "NO_GO", "GO_WITH_CAUTION"], required: true, index: true },
    evaluatedAt: { type: Date, required: true, index: true },
    metadata,
  },
  { timestamps: true },
);

const deploymentEventSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    environmentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    eventType: { type: String, enum: ["DEPLOYMENT", "ROLLBACK", "STARTUP_FAILURE", "INCIDENT"], required: true, index: true },
    service: { type: String, enum: ["AI_BRAIN", "REALTIME_GATEWAY", "AUTOMATION_WORKER", "WEB", "API"], required: true, index: true },
    status: { type: String, enum: ["PENDING", "IN_PROGRESS", "SUCCEEDED", "FAILED", "ROLLED_BACK"], required: true, index: true },
    message: { type: String, required: true },
    occurredAt: { type: Date, required: true, index: true },
    metadata,
  },
  { timestamps: true },
);

const launchStatusSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    state: { type: String, enum: ["PLANNING", "VALIDATING", "READY", "LAUNCHED", "PAUSED", "BLOCKED"], default: "PLANNING", index: true },
    goNoGo: { type: String, enum: ["GO", "NO_GO", "PENDING"], default: "PENDING", index: true },
    finalReadinessScore: { type: Number, default: 0 },
    message: { type: String, default: "" },
    updatedBy: { type: String, default: null },
    metadata,
  },
  { timestamps: true },
);
launchStatusSchema.index({ organizationId: 1, updatedAt: -1 });

const model = (name: string, schema: mongoose.Schema, collection: string): mongoose.Model<any> =>
  (mongoose.models[name] as mongoose.Model<any> | undefined) ?? mongoose.model<any>(name, schema, collection);

export const DeploymentEnvironmentModel = model("DeploymentEnvironment", deploymentEnvironmentSchema, "deploymentenvironments");
export const DeploymentTargetModel = model("DeploymentTarget", deploymentTargetSchema, "deploymenttargets");
export const EnvironmentValidationModel = model("EnvironmentValidation", environmentValidationSchema, "environmentvalidations");
export const StartupCheckModel = model("StartupCheck", startupCheckSchema, "startupchecks");
export const ConfigurationIssueModel = model("ConfigurationIssue", configurationIssueSchema, "configurationissues");
export const SecurityFindingModel = model("SecurityFinding", securityFindingSchema, "securityfindings");
export const BackupJobModel = model("BackupJob", backupJobSchema, "backupjobs");
export const BackupSnapshotModel = model("BackupSnapshot", backupSnapshotSchema, "backupsnapshots");
export const RecoveryPlanModel = model("RecoveryPlan", recoveryPlanSchema, "recoveryplans");
export const DisasterRecoveryPlanModel = model("DisasterRecoveryPlan", disasterRecoveryPlanSchema, "disasterrecoveryplans");
export const ReleaseChecklistModel = model("ReleaseChecklist", releaseChecklistSchema, "releasechecklists");
export const ReleaseReadinessModel = model("ReleaseReadiness", releaseReadinessSchema, "releasereadiness");
export const DeploymentEventModel = model("DeploymentEvent", deploymentEventSchema, "deploymentevents");
export const LaunchStatusModel = model("LaunchStatus", launchStatusSchema, "launchstatuses");
