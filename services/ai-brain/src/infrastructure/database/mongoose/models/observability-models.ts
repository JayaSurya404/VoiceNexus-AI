import mongoose from "mongoose";

const nullableOrganizationId = { type: mongoose.Schema.Types.ObjectId, default: null, index: true };

const healthCheckSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    service: { type: String, required: true, index: true },
    checkType: { type: String, enum: ["HEALTH", "LIVENESS", "READINESS"], required: true, index: true },
    status: { type: String, enum: ["HEALTHY", "DEGRADED", "UNHEALTHY"], required: true, index: true },
    latencyMs: { type: Number, default: 0 },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    checkedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);
healthCheckSchema.index({ organizationId: 1, service: 1, checkType: 1, checkedAt: -1 });

const metricSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    name: { type: String, required: true, index: true },
    kind: { type: String, enum: ["COUNTER", "GAUGE", "HISTOGRAM"], required: true },
    value: { type: Number, required: true },
    unit: { type: String, default: "count" },
    tags: { type: mongoose.Schema.Types.Mixed, default: {} },
    recordedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);
metricSchema.index({ organizationId: 1, name: 1, recordedAt: -1 });

const metricSnapshotSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    category: { type: String, enum: ["SYSTEM", "APPLICATION", "SERVICE"], required: true, index: true },
    metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    capturedAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);
metricSnapshotSchema.index({ organizationId: 1, category: 1, capturedAt: -1 });

const traceSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    traceId: { type: String, required: true, index: true },
    rootSpanId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    status: { type: String, enum: ["OK", "ERROR", "TIMEOUT"], default: "OK", index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
traceSchema.index({ organizationId: 1, traceId: 1 });

const spanSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    traceId: { type: String, required: true, index: true },
    spanId: { type: String, required: true, index: true },
    parentSpanId: { type: String, default: null, index: true },
    name: { type: String, required: true },
    status: { type: String, enum: ["OK", "ERROR", "TIMEOUT"], default: "OK", index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
spanSchema.index({ organizationId: 1, traceId: 1, spanId: 1 });

const eventLogSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    traceId: { type: String, default: null, index: true },
    source: { type: String, enum: ["API", "AI", "TWILIO", "WORKFLOW", "AUTOMATION", "SYSTEM"], required: true, index: true },
    eventName: { type: String, required: true, index: true },
    severity: { type: String, enum: ["DEBUG", "INFO", "WARN", "ERROR"], default: "INFO", index: true },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    occurredAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);
eventLogSchema.index({ organizationId: 1, occurredAt: -1 });

const errorEventSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    service: { type: String, required: true, index: true },
    fingerprint: { type: String, required: true, index: true },
    message: { type: String, required: true },
    stack: { type: String, default: null },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM", index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    occurredAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);
errorEventSchema.index({ organizationId: 1, fingerprint: 1, occurredAt: -1 });

const errorFingerprintSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    fingerprint: { type: String, required: true, index: true },
    message: { type: String, required: true },
    service: { type: String, required: true, index: true },
    frequency: { type: Number, default: 1 },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM" },
    firstSeenAt: { type: Date, required: true },
    lastSeenAt: { type: Date, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
errorFingerprintSchema.index({ organizationId: 1, fingerprint: 1 }, { unique: true });

const errorIncidentSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    fingerprint: { type: String, required: true, index: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "ACKNOWLEDGED", "RESOLVED"], default: "OPEN", index: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM", index: true },
    eventCount: { type: Number, default: 1 },
    firstOccurrenceAt: { type: Date, required: true },
    lastOccurrenceAt: { type: Date, required: true },
    assigneeId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
errorIncidentSchema.index({ organizationId: 1, status: 1, severity: 1 });

const rateLimitRuleSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    scope: { type: String, enum: ["USER", "ORGANIZATION", "API_KEY"], required: true, index: true },
    subjectId: { type: String, default: null, index: true },
    limit: { type: Number, required: true },
    windowSeconds: { type: Number, required: true },
    active: { type: Boolean, default: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
rateLimitRuleSchema.index({ organizationId: 1, scope: 1, subjectId: 1 });

const rateLimitStateSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    scope: { type: String, enum: ["USER", "ORGANIZATION", "API_KEY"], required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    count: { type: Number, default: 0 },
    resetAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);
rateLimitStateSchema.index({ organizationId: 1, scope: 1, subjectId: 1 }, { unique: true });

const retryPolicySchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    provider: { type: String, enum: ["OPENAI", "GROQ", "GEMINI", "TWILIO", "REDIS"], required: true, index: true },
    maxAttempts: { type: Number, default: 3 },
    backoffMs: { type: Number, default: 500 },
    jitter: { type: Boolean, default: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);
retryPolicySchema.index({ organizationId: 1, provider: 1 }, { unique: true });

const circuitBreakerSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    provider: { type: String, enum: ["OPENAI", "GROQ", "GEMINI", "TWILIO", "REDIS"], required: true, index: true },
    state: { type: String, enum: ["CLOSED", "OPEN", "HALF_OPEN"], default: "CLOSED", index: true },
    failureThreshold: { type: Number, default: 5 },
    failureCount: { type: Number, default: 0 },
    resetAfterSeconds: { type: Number, default: 60 },
    openedAt: { type: Date, default: null },
    lastFailureAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
circuitBreakerSchema.index({ organizationId: 1, provider: 1 }, { unique: true });

const fallbackStrategySchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    provider: { type: String, enum: ["OPENAI", "GROQ", "GEMINI", "TWILIO", "REDIS"], required: true, index: true },
    strategy: { type: String, enum: ["USE_CACHE", "USE_BACKUP_PROVIDER", "DEGRADE_GRACEFULLY", "QUEUE_FOR_RETRY"], required: true },
    enabled: { type: Boolean, default: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
fallbackStrategySchema.index({ organizationId: 1, provider: 1 }, { unique: true });

const distributedLockSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    lockKey: { type: String, required: true, index: true },
    ownerId: { type: String, required: true, index: true },
    purpose: { type: String, enum: ["JOB", "WORKFLOW", "AUTOMATION", "SYSTEM"], required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    acquiredAt: { type: Date, required: true },
    releasedAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
distributedLockSchema.index({ organizationId: 1, lockKey: 1, releasedAt: 1 });

const alertRuleSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    name: { type: String, required: true },
    trigger: {
      type: String,
      enum: ["SERVICE_DOWN", "DATABASE_UNAVAILABLE", "REDIS_UNAVAILABLE", "HIGH_LATENCY", "EXCESSIVE_FAILURES"],
      required: true,
      index: true,
    },
    threshold: { type: Number, required: true },
    windowSeconds: { type: Number, default: 300 },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM", index: true },
    active: { type: Boolean, default: true, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
alertRuleSchema.index({ organizationId: 1, trigger: 1 });

const alertEventSchema = new mongoose.Schema(
  {
    organizationId: nullableOrganizationId,
    ruleId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    trigger: {
      type: String,
      enum: ["SERVICE_DOWN", "DATABASE_UNAVAILABLE", "REDIS_UNAVAILABLE", "HIGH_LATENCY", "EXCESSIVE_FAILURES"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "MEDIUM", index: true },
    status: { type: String, enum: ["OPEN", "ACKNOWLEDGED", "RESOLVED"], default: "OPEN", index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
alertEventSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

const model = (name: string, schema: mongoose.Schema, collection: string): mongoose.Model<any> =>
  (mongoose.models[name] as mongoose.Model<any> | undefined) ?? mongoose.model<any>(name, schema, collection);

export const HealthCheckModel = model("HealthCheck", healthCheckSchema, "healthchecks");
export const MetricModel = model("Metric", metricSchema, "metrics");
export const MetricSnapshotModel = model("MetricSnapshot", metricSnapshotSchema, "metricsnapshots");
export const TraceModel = model("Trace", traceSchema, "traces");
export const SpanModel = model("Span", spanSchema, "spans");
export const EventLogModel = model("EventLog", eventLogSchema, "eventlogs");
export const ErrorEventModel = model("ErrorEvent", errorEventSchema, "errorevents");
export const ErrorFingerprintModel = model("ErrorFingerprint", errorFingerprintSchema, "errorfingerprints");
export const ErrorIncidentModel = model("ErrorIncident", errorIncidentSchema, "errorincidents");
export const RateLimitRuleModel = model("RateLimitRule", rateLimitRuleSchema, "ratelimitrules");
export const RateLimitStateModel = model("RateLimitState", rateLimitStateSchema, "ratelimitstates");
export const RetryPolicyModel = model("RetryPolicy", retryPolicySchema, "retrypolicies");
export const CircuitBreakerModel = model("CircuitBreaker", circuitBreakerSchema, "circuitbreakers");
export const FallbackStrategyModel = model("FallbackStrategy", fallbackStrategySchema, "fallbackstrategies");
export const DistributedLockModel = model("DistributedLock", distributedLockSchema, "distributedlocks");
export const AlertRuleModel = model("AlertRule", alertRuleSchema, "alertrules");
export const AlertEventModel = model("AlertEvent", alertEventSchema, "alertevents");
