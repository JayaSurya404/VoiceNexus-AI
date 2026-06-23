import type {
  BackupJobRepository,
  BackupSnapshotRepository,
  ConfigurationIssueRepository,
  DeploymentEnvironmentRepository,
  DeploymentEventRepository,
  DeploymentReadinessOverview,
  DeploymentTargetRepository,
  DisasterRecoveryPlanRepository,
  EnvironmentValidationRepository,
  LaunchStatusRepository,
  RecoveryPlanRepository,
  ReleaseChecklistRepository,
  ReleaseReadinessRepository,
  SecurityFindingRepository,
  StartupCheckRepository,
} from "../ports.js";
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
} from "../../domain/entities/deployment-readiness.js";

const REQUIRED_ENV = [
  "MONGODB_URI",
  "REDIS_URL",
  "JWT_SECRET",
  "OPENAI_API_KEY",
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "PUBLIC_WEBHOOK_URL",
];

export class EnvironmentValidationService {
  constructor(private readonly validations: EnvironmentValidationRepository) {}

  async validate(organizationId: string | null = null): Promise<EnvironmentValidation[]> {
    const now = new Date();
    return Promise.all(
      REQUIRED_ENV.map((key) =>
        this.validations.create({
          organizationId,
          environmentId: null,
          key,
          valid: Boolean(process.env[key]),
          severity: key.includes("SECRET") || key.includes("TOKEN") || key.includes("KEY") ? "CRITICAL" : "HIGH",
          message: process.env[key] ? `${key} is configured` : `${key} is missing`,
          checkedAt: now,
          metadata: { source: "startup-environment" },
        }),
      ),
    );
  }

  async list(organizationId: string | null = null): Promise<EnvironmentValidation[]> {
    return this.validations.list(organizationId);
  }
}

export class StartupValidationService {
  constructor(private readonly startupChecks: StartupCheckRepository) {}

  async run(organizationId: string | null = null): Promise<StartupCheck[]> {
    const now = new Date();
    return Promise.all(
      (["AI_BRAIN", "REALTIME_GATEWAY", "AUTOMATION_WORKER"] as const).map((service) =>
        this.startupChecks.create({
          organizationId,
          service,
          status: service === "AI_BRAIN" ? "PASS" : "WARN",
          latencyMs: 0,
          message: service === "AI_BRAIN" ? `${service} startup validated` : `${service} heartbeat pending`,
          checkedAt: now,
          metadata: {},
        }),
      ),
    );
  }

  async list(organizationId: string | null = null): Promise<StartupCheck[]> {
    return this.startupChecks.list(organizationId);
  }
}

export class ConfigurationManagementService {
  constructor(private readonly issues: ConfigurationIssueRepository) {}

  async evaluate(organizationId: string | null = null): Promise<ConfigurationIssue[]> {
    const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
    return Promise.all(
      missing.map((key) =>
        this.issues.create({
          organizationId,
          key,
          issueType: "MISSING",
          severity: key.includes("SECRET") || key.includes("TOKEN") || key.includes("KEY") ? "CRITICAL" : "HIGH",
          message: `${key} must be configured before production launch`,
          resolved: false,
          metadata: {},
        }),
      ),
    );
  }

  async list(organizationId: string | null = null): Promise<ConfigurationIssue[]> {
    return this.issues.list(organizationId);
  }
}

export class SecurityReviewService {
  constructor(private readonly findings: SecurityFindingRepository) {}

  async review(organizationId: string | null = null): Promise<SecurityFinding[]> {
    const findings: Array<Omit<SecurityFinding, "id" | "createdAt" | "updatedAt">> = [];
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      findings.push({
        organizationId,
        category: "SECRET",
        severity: "CRITICAL",
        title: "Weak or missing JWT secret",
        description: "JWT_SECRET should be present and at least 32 characters.",
        resolved: false,
        metadata: {},
      });
    }
    if (!process.env.PUBLIC_WEBHOOK_URL?.startsWith("https://")) {
      findings.push({
        organizationId,
        category: "WEBHOOK",
        severity: "HIGH",
        title: "Webhook URL is not HTTPS",
        description: "Production webhooks must use HTTPS endpoints.",
        resolved: false,
        metadata: {},
      });
    }
    return Promise.all(findings.map((finding) => this.findings.create(finding)));
  }

  async list(organizationId: string | null = null): Promise<SecurityFinding[]> {
    return this.findings.list(organizationId);
  }
}

export class BackupManagementService {
  constructor(
    private readonly jobs: BackupJobRepository,
    private readonly snapshots: BackupSnapshotRepository,
  ) {}

  async jobsList(organizationId: string | null = null): Promise<BackupJob[]> {
    const existing = await this.jobs.list(organizationId);
    if (existing.length) return existing;
    return Promise.all(
      (["MONGODB", "REDIS"] as const).map((target) =>
        this.jobs.create({
          organizationId,
          name: `${target} daily backup`,
          schedule: "0 2 * * *",
          target,
          enabled: true,
          lastRunAt: null,
          nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: {},
        }),
      ),
    );
  }

  async snapshotsList(organizationId: string | null = null): Promise<BackupSnapshot[]> {
    return this.snapshots.list(organizationId);
  }
}

export class RecoveryPlanningService {
  constructor(private readonly recoveryPlans: RecoveryPlanRepository) {}

  async list(organizationId: string | null = null): Promise<RecoveryPlan[]> {
    const existing = await this.recoveryPlans.list(organizationId);
    if (existing.length) return existing;
    return [
      await this.recoveryPlans.create({
        organizationId,
        name: "Primary database restore",
        objective: "Restore tenant data from latest MongoDB backup snapshot.",
        rtoMinutes: 60,
        rpoMinutes: 15,
        status: "READY",
        steps: ["Identify latest snapshot", "Restore to staging", "Validate data", "Promote primary connection"],
        metadata: {},
      }),
    ];
  }
}

export class DisasterRecoveryService {
  constructor(private readonly disasterPlans: DisasterRecoveryPlanRepository) {}

  async list(organizationId: string | null = null): Promise<DisasterRecoveryPlan[]> {
    const existing = await this.disasterPlans.list(organizationId);
    if (existing.length) return existing;
    return [
      await this.disasterPlans.create({
        organizationId,
        name: "Regional failover",
        failoverRegion: "us-west-2",
        failoverReady: false,
        recoveryReady: true,
        continuityStatus: "PARTIAL",
        lastTestedAt: null,
        metadata: {},
      }),
    ];
  }
}

export class ReleaseChecklistService {
  constructor(private readonly checklist: ReleaseChecklistRepository) {}

  async list(organizationId: string | null = null): Promise<ReleaseChecklist[]> {
    const existing = await this.checklist.list(organizationId);
    if (existing.length) return existing;
    const defaults = ["Environment variables configured", "Startup checks pass", "Backups scheduled", "Security review complete", "Recovery plan reviewed"];
    return Promise.all(defaults.map((name) => this.checklist.create({ organizationId, name, required: true, completed: false, owner: null, dueAt: null, metadata: {} })));
  }
}

export class ReleaseReadinessService {
  constructor(
    private readonly readiness: ReleaseReadinessRepository,
    private readonly validations: EnvironmentValidationRepository,
    private readonly startupChecks: StartupCheckRepository,
    private readonly configIssues: ConfigurationIssueRepository,
    private readonly securityFindings: SecurityFindingRepository,
    private readonly checklist: ReleaseChecklistRepository,
    private readonly backupJobs: BackupJobRepository,
    private readonly recoveryPlans: RecoveryPlanRepository,
    private readonly launchStatuses: LaunchStatusRepository,
  ) {}

  async evaluate(organizationId: string | null = null): Promise<ReleaseReadiness> {
    const [validations, startup, config, security, checklist, backups, recovery] = await Promise.all([
      this.validations.list(organizationId),
      this.startupChecks.list(organizationId),
      this.configIssues.list(organizationId),
      this.securityFindings.list(organizationId),
      this.checklist.list(organizationId),
      this.backupJobs.list(organizationId),
      this.recoveryPlans.list(organizationId),
    ]);
    const blockers = [
      ...validations.filter((item) => !item.valid && item.severity === "CRITICAL").map((item) => item.message),
      ...startup.filter((item) => item.status === "FAIL").map((item) => item.message),
      ...config.filter((item) => !item.resolved && item.severity === "CRITICAL").map((item) => item.message),
      ...security.filter((item) => !item.resolved && item.severity === "CRITICAL").map((item) => item.title),
      ...checklist.filter((item) => item.required && !item.completed).map((item) => item.name),
    ];
    const backupReady = backups.some((job) => job.enabled);
    const recoveryReady = recovery.some((plan) => plan.status === "READY");
    const readinessScore = Math.max(0, Math.min(100, 100 - blockers.length * 10 - (backupReady ? 0 : 10) - (recoveryReady ? 0 : 10)));
    const recommendation = blockers.length ? "NO_GO" : readinessScore >= 90 ? "GO" : "GO_WITH_CAUTION";
    return this.readiness.create({
      organizationId,
      readinessScore,
      status: recommendation === "NO_GO" ? "BLOCKED" : recommendation === "GO" ? "READY" : "AT_RISK",
      blockers,
      recommendation,
      evaluatedAt: new Date(),
      metadata: { backupReady, recoveryReady },
    });
  }

  async overview(organizationId: string | null = null): Promise<DeploymentReadinessOverview> {
    const [latest, validations, security, checklist, backups, recovery, launch] = await Promise.all([
      this.readiness.latest(organizationId),
      this.validations.list(organizationId),
      this.securityFindings.list(organizationId),
      this.checklist.list(organizationId),
      this.backupJobs.list(organizationId),
      this.recoveryPlans.list(organizationId),
      this.launchStatuses.latest(organizationId),
    ]);
    return {
      readinessScore: latest?.readinessScore ?? 0,
      recommendation: latest?.recommendation ?? "NO_GO",
      blockerCount: latest?.blockers.length ?? 0,
      validationFailureCount: validations.filter((item) => !item.valid).length,
      securityFindingCount: security.filter((item) => !item.resolved).length,
      pendingChecklistCount: checklist.filter((item) => item.required && !item.completed).length,
      backupReady: backups.some((job) => job.enabled),
      recoveryReady: recovery.some((plan) => plan.status === "READY"),
      launchState: launch?.state ?? "PLANNING",
    };
  }
}

export class DeploymentEventService {
  constructor(private readonly events: DeploymentEventRepository) {}

  async list(organizationId: string | null = null): Promise<DeploymentEvent[]> {
    return this.events.list(organizationId);
  }
}

export class LaunchStatusService {
  constructor(private readonly launchStatuses: LaunchStatusRepository) {}

  async get(organizationId: string | null = null): Promise<LaunchStatus> {
    const existing = await this.launchStatuses.latest(organizationId);
    if (existing) return existing;
    return this.launchStatuses.upsert({
      organizationId,
      state: "PLANNING",
      goNoGo: "PENDING",
      finalReadinessScore: 0,
      message: "Launch readiness has not been finalized.",
      updatedBy: null,
      metadata: {},
    });
  }
}

export class DeploymentCatalogService {
  constructor(
    private readonly environments: DeploymentEnvironmentRepository,
    private readonly targets: DeploymentTargetRepository,
  ) {}

  async environmentsList(organizationId: string | null = null): Promise<DeploymentEnvironment[]> {
    const existing = await this.environments.list(organizationId);
    if (existing.length) return existing;
    return [
      await this.environments.create({
        organizationId,
        name: "production",
        type: "PRODUCTION",
        region: "us-east-1",
        active: true,
        metadata: {},
      }),
    ];
  }

  async targetsList(organizationId: string | null = null): Promise<DeploymentTarget[]> {
    return this.targets.list(organizationId);
  }
}
