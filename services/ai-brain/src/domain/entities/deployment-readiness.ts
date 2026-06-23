export type DeploymentStatus = "PENDING" | "IN_PROGRESS" | "SUCCEEDED" | "FAILED" | "ROLLED_BACK";
export type ReadinessStatus = "READY" | "BLOCKED" | "AT_RISK";
export type FindingSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DeploymentEnvironment {
  id: string;
  organizationId: string | null;
  name: string;
  type: "DEVELOPMENT" | "STAGING" | "PRODUCTION";
  region: string;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeploymentTarget {
  id: string;
  organizationId: string | null;
  environmentId: string | null;
  service: "AI_BRAIN" | "REALTIME_GATEWAY" | "AUTOMATION_WORKER" | "WEB" | "API";
  version: string;
  status: DeploymentStatus;
  url: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentValidation {
  id: string;
  organizationId: string | null;
  environmentId: string | null;
  key: string;
  valid: boolean;
  severity: FindingSeverity;
  message: string;
  checkedAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StartupCheck {
  id: string;
  organizationId: string | null;
  service: DeploymentTarget["service"];
  status: "PASS" | "WARN" | "FAIL";
  latencyMs: number;
  message: string;
  checkedAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationIssue {
  id: string;
  organizationId: string | null;
  key: string;
  issueType: "MISSING" | "INVALID" | "UNSAFE" | "DEPRECATED";
  severity: FindingSeverity;
  message: string;
  resolved: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityFinding {
  id: string;
  organizationId: string | null;
  category: "SECRET" | "AUTH" | "NETWORK" | "WEBHOOK" | "CONFIGURATION";
  severity: FindingSeverity;
  title: string;
  description: string;
  resolved: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupJob {
  id: string;
  organizationId: string | null;
  name: string;
  schedule: string;
  target: "MONGODB" | "REDIS" | "FILES";
  enabled: boolean;
  lastRunAt: Date | null;
  nextRunAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackupSnapshot {
  id: string;
  organizationId: string | null;
  jobId: string | null;
  target: BackupJob["target"];
  status: "PENDING" | "COMPLETED" | "FAILED";
  sizeBytes: number;
  location: string | null;
  capturedAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecoveryPlan {
  id: string;
  organizationId: string | null;
  name: string;
  objective: string;
  rtoMinutes: number;
  rpoMinutes: number;
  status: "DRAFT" | "READY" | "TESTING" | "FAILED";
  steps: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisasterRecoveryPlan {
  id: string;
  organizationId: string | null;
  name: string;
  failoverRegion: string;
  failoverReady: boolean;
  recoveryReady: boolean;
  continuityStatus: "READY" | "PARTIAL" | "NOT_READY";
  lastTestedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReleaseChecklist {
  id: string;
  organizationId: string | null;
  name: string;
  required: boolean;
  completed: boolean;
  owner: string | null;
  dueAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReleaseReadiness {
  id: string;
  organizationId: string | null;
  readinessScore: number;
  status: ReadinessStatus;
  blockers: string[];
  recommendation: "GO" | "NO_GO" | "GO_WITH_CAUTION";
  evaluatedAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeploymentEvent {
  id: string;
  organizationId: string | null;
  environmentId: string | null;
  eventType: "DEPLOYMENT" | "ROLLBACK" | "STARTUP_FAILURE" | "INCIDENT";
  service: DeploymentTarget["service"];
  status: DeploymentStatus;
  message: string;
  occurredAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LaunchStatus {
  id: string;
  organizationId: string | null;
  state: "PLANNING" | "VALIDATING" | "READY" | "LAUNCHED" | "PAUSED" | "BLOCKED";
  goNoGo: "GO" | "NO_GO" | "PENDING";
  finalReadinessScore: number;
  message: string;
  updatedBy: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
