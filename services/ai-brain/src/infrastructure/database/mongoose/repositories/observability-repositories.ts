import type { AlertEvent, AlertRule } from "../../../../domain/entities/alert.js";
import type { DistributedLock } from "../../../../domain/entities/distributed-lock.js";
import type { ErrorEvent, ErrorFingerprint, ErrorIncident } from "../../../../domain/entities/error-event.js";
import type { HealthCheck } from "../../../../domain/entities/health-check.js";
import type { Metric, MetricSnapshot } from "../../../../domain/entities/metric.js";
import type { RateLimitState } from "../../../../domain/entities/rate-limit.js";
import type { CircuitBreaker, FallbackStrategy, RetryPolicy } from "../../../../domain/entities/resilience.js";
import type { EventLog, Span, Trace } from "../../../../domain/entities/trace.js";
import type {
  AlertEventRepository,
  AlertRuleRepository,
  CircuitBreakerRepository,
  DistributedLockRepository,
  ErrorEventRepository,
  ErrorFingerprintRepository,
  ErrorIncidentRepository,
  EventLogRepository,
  FallbackStrategyRepository,
  HealthCheckRepository,
  MetricRepository,
  MetricSnapshotRepository,
  RateLimitRuleRepository,
  RateLimitStateRepository,
  RetryPolicyRepository,
  SpanRepository,
  TraceRepository,
} from "../../../../application/ports.js";
import {
  AlertEventModel,
  AlertRuleModel,
  CircuitBreakerModel,
  DistributedLockModel,
  ErrorEventModel,
  ErrorFingerprintModel,
  ErrorIncidentModel,
  EventLogModel,
  FallbackStrategyModel,
  HealthCheckModel,
  MetricModel,
  MetricSnapshotModel,
  RateLimitRuleModel,
  RateLimitStateModel,
  RetryPolicyModel,
  SpanModel,
  TraceModel,
} from "../models/observability-models.js";
import { objectId } from "./repository-utils.js";

type Doc = Record<string, any>;

const maybeOrganization = (organizationId?: string | null) => (organizationId ? { organizationId: objectId(organizationId) } : {});
const nullableOrganization = (organizationId: string | null | undefined) => (organizationId ? objectId(organizationId) : null);
const asId = (value: unknown): string | null => (value ? String(value) : null);
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
const asDate = (value: unknown): Date => (value instanceof Date ? value : new Date(String(value)));

const one = (doc: Doc | Doc[] | null, label: string): Doc => {
  if (!doc || Array.isArray(doc)) {
    throw new Error(`${label} did not return a document`);
  }
  return doc;
};

const toHealthCheck = (doc: Doc): HealthCheck => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  service: String(doc.service),
  checkType: doc.checkType,
  status: doc.status,
  latencyMs: Number(doc.latencyMs ?? 0),
  details: asRecord(doc.details),
  checkedAt: asDate(doc.checkedAt),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toMetric = (doc: Doc): Metric => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  name: String(doc.name),
  kind: doc.kind,
  value: Number(doc.value ?? 0),
  unit: String(doc.unit ?? "count"),
  tags: Object.fromEntries(Object.entries(asRecord(doc.tags)).map(([key, value]) => [key, String(value)])),
  recordedAt: asDate(doc.recordedAt),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toMetricSnapshot = (doc: Doc): MetricSnapshot => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  category: doc.category,
  metrics: Object.fromEntries(Object.entries(asRecord(doc.metrics)).map(([key, value]) => [key, Number(value)])),
  capturedAt: asDate(doc.capturedAt),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toTrace = (doc: Doc): Trace => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  traceId: String(doc.traceId),
  rootSpanId: doc.rootSpanId ?? null,
  name: String(doc.name),
  status: doc.status,
  startedAt: asDate(doc.startedAt),
  endedAt: doc.endedAt ? asDate(doc.endedAt) : null,
  durationMs: doc.durationMs == null ? null : Number(doc.durationMs),
  attributes: asRecord(doc.attributes),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toSpan = (doc: Doc): Span => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  traceId: String(doc.traceId),
  spanId: String(doc.spanId),
  parentSpanId: doc.parentSpanId ?? null,
  name: String(doc.name),
  status: doc.status,
  startedAt: asDate(doc.startedAt),
  endedAt: doc.endedAt ? asDate(doc.endedAt) : null,
  durationMs: doc.durationMs == null ? null : Number(doc.durationMs),
  attributes: asRecord(doc.attributes),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toEventLog = (doc: Doc): EventLog => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  traceId: doc.traceId ?? null,
  source: doc.source,
  eventName: String(doc.eventName),
  severity: doc.severity,
  message: String(doc.message),
  metadata: asRecord(doc.metadata),
  occurredAt: asDate(doc.occurredAt),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toErrorEvent = (doc: Doc): ErrorEvent => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  service: String(doc.service),
  fingerprint: String(doc.fingerprint),
  message: String(doc.message),
  stack: doc.stack ?? null,
  severity: doc.severity,
  metadata: asRecord(doc.metadata),
  occurredAt: asDate(doc.occurredAt),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toErrorFingerprint = (doc: Doc): ErrorFingerprint => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  fingerprint: String(doc.fingerprint),
  message: String(doc.message),
  service: String(doc.service),
  frequency: Number(doc.frequency ?? 0),
  severity: doc.severity,
  firstSeenAt: asDate(doc.firstSeenAt),
  lastSeenAt: asDate(doc.lastSeenAt),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toErrorIncident = (doc: Doc): ErrorIncident => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  fingerprint: String(doc.fingerprint),
  title: String(doc.title),
  status: doc.status,
  severity: doc.severity,
  eventCount: Number(doc.eventCount ?? 0),
  firstOccurrenceAt: asDate(doc.firstOccurrenceAt),
  lastOccurrenceAt: asDate(doc.lastOccurrenceAt),
  assigneeId: doc.assigneeId ?? null,
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toRetryPolicy = (doc: Doc): RetryPolicy => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  provider: doc.provider,
  maxAttempts: Number(doc.maxAttempts ?? 3),
  backoffMs: Number(doc.backoffMs ?? 500),
  jitter: Boolean(doc.jitter),
  active: Boolean(doc.active),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toCircuitBreaker = (doc: Doc): CircuitBreaker => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  provider: doc.provider,
  state: doc.state,
  failureThreshold: Number(doc.failureThreshold ?? 5),
  failureCount: Number(doc.failureCount ?? 0),
  resetAfterSeconds: Number(doc.resetAfterSeconds ?? 60),
  openedAt: doc.openedAt ? asDate(doc.openedAt) : null,
  lastFailureAt: doc.lastFailureAt ? asDate(doc.lastFailureAt) : null,
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toFallbackStrategy = (doc: Doc): FallbackStrategy => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  provider: doc.provider,
  strategy: doc.strategy,
  enabled: Boolean(doc.enabled),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toDistributedLock = (doc: Doc): DistributedLock => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  lockKey: String(doc.lockKey),
  ownerId: String(doc.ownerId),
  purpose: doc.purpose,
  expiresAt: asDate(doc.expiresAt),
  acquiredAt: asDate(doc.acquiredAt),
  releasedAt: doc.releasedAt ? asDate(doc.releasedAt) : null,
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toAlertRule = (doc: Doc): AlertRule => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  name: String(doc.name),
  trigger: doc.trigger,
  threshold: Number(doc.threshold ?? 0),
  windowSeconds: Number(doc.windowSeconds ?? 300),
  severity: doc.severity,
  active: Boolean(doc.active),
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

const toAlertEvent = (doc: Doc): AlertEvent => ({
  id: String(doc._id),
  organizationId: asId(doc.organizationId),
  ruleId: asId(doc.ruleId),
  trigger: doc.trigger,
  title: String(doc.title),
  message: String(doc.message),
  severity: doc.severity,
  status: doc.status,
  metadata: asRecord(doc.metadata),
  createdAt: asDate(doc.createdAt),
  updatedAt: asDate(doc.updatedAt),
});

export class MongoHealthCheckRepository implements HealthCheckRepository {
  async create(input: Omit<HealthCheck, "id" | "createdAt" | "updatedAt">): Promise<HealthCheck> {
    return toHealthCheck(await HealthCheckModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }

  async latest(organizationId?: string | null): Promise<HealthCheck[]> {
    const docs = await HealthCheckModel.find(maybeOrganization(organizationId)).sort({ checkedAt: -1 }).limit(50).lean();
    return docs.map(toHealthCheck);
  }
}

export class MongoMetricRepository implements MetricRepository {
  async create(input: Omit<Metric, "id" | "createdAt" | "updatedAt">): Promise<Metric> {
    return toMetric(await MetricModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }

  async list(organizationId?: string | null): Promise<Metric[]> {
    const docs = await MetricModel.find(maybeOrganization(organizationId)).sort({ recordedAt: -1 }).limit(200).lean();
    return docs.map(toMetric);
  }
}

export class MongoMetricSnapshotRepository implements MetricSnapshotRepository {
  async create(input: Omit<MetricSnapshot, "id" | "createdAt" | "updatedAt">): Promise<MetricSnapshot> {
    return toMetricSnapshot(await MetricSnapshotModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }

  async latest(category?: MetricSnapshot["category"], organizationId?: string | null): Promise<MetricSnapshot[]> {
    const docs = await MetricSnapshotModel.find({ ...maybeOrganization(organizationId), ...(category ? { category } : {}) })
      .sort({ capturedAt: -1 })
      .limit(50)
      .lean();
    return docs.map(toMetricSnapshot);
  }
}

export class MongoTraceRepository implements TraceRepository {
  async create(input: Omit<Trace, "id" | "createdAt" | "updatedAt">): Promise<Trace> {
    return toTrace(await TraceModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }

  async list(organizationId?: string | null): Promise<Trace[]> {
    const docs = await TraceModel.find(maybeOrganization(organizationId)).sort({ startedAt: -1 }).limit(100).lean();
    return docs.map(toTrace);
  }
}

export class MongoSpanRepository implements SpanRepository {
  async create(input: Omit<Span, "id" | "createdAt" | "updatedAt">): Promise<Span> {
    return toSpan(await SpanModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }

  async listByTrace(traceId: string, organizationId?: string | null): Promise<Span[]> {
    const docs = await SpanModel.find({ ...maybeOrganization(organizationId), traceId }).sort({ startedAt: 1 }).lean();
    return docs.map(toSpan);
  }
}

export class MongoEventLogRepository implements EventLogRepository {
  async create(input: Omit<EventLog, "id" | "createdAt" | "updatedAt">): Promise<EventLog> {
    return toEventLog(await EventLogModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }

  async list(organizationId?: string | null): Promise<EventLog[]> {
    const docs = await EventLogModel.find(maybeOrganization(organizationId)).sort({ occurredAt: -1 }).limit(200).lean();
    return docs.map(toEventLog);
  }
}

export class MongoErrorEventRepository implements ErrorEventRepository {
  async create(input: Omit<ErrorEvent, "id" | "createdAt" | "updatedAt">): Promise<ErrorEvent> {
    return toErrorEvent(await ErrorEventModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }

  async list(organizationId?: string | null): Promise<ErrorEvent[]> {
    const docs = await ErrorEventModel.find(maybeOrganization(organizationId)).sort({ occurredAt: -1 }).limit(200).lean();
    return docs.map(toErrorEvent);
  }
}

export class MongoErrorFingerprintRepository implements ErrorFingerprintRepository {
  async upsert(input: Omit<ErrorFingerprint, "id" | "createdAt" | "updatedAt">): Promise<ErrorFingerprint> {
    const doc = await ErrorFingerprintModel.findOneAndUpdate(
      { organizationId: nullableOrganization(input.organizationId), fingerprint: input.fingerprint },
      {
        $set: {
          message: input.message,
          service: input.service,
          severity: input.severity,
          lastSeenAt: input.lastSeenAt,
          metadata: input.metadata,
        },
        $setOnInsert: { ...input, organizationId: nullableOrganization(input.organizationId), frequency: 0 },
        $inc: { frequency: 1 },
      },
      { new: true, upsert: true },
    ).lean();
    return toErrorFingerprint(one(doc, "Error fingerprint upsert"));
  }

  async list(organizationId?: string | null): Promise<ErrorFingerprint[]> {
    const docs = await ErrorFingerprintModel.find(maybeOrganization(organizationId)).sort({ lastSeenAt: -1 }).limit(100).lean();
    return docs.map(toErrorFingerprint);
  }
}

export class MongoErrorIncidentRepository implements ErrorIncidentRepository {
  async upsert(input: Omit<ErrorIncident, "id" | "createdAt" | "updatedAt">): Promise<ErrorIncident> {
    const doc = await ErrorIncidentModel.findOneAndUpdate(
      { organizationId: nullableOrganization(input.organizationId), fingerprint: input.fingerprint, status: { $ne: "RESOLVED" } },
      {
        $set: { lastOccurrenceAt: input.lastOccurrenceAt, severity: input.severity, metadata: input.metadata },
        $setOnInsert: { ...input, organizationId: nullableOrganization(input.organizationId), eventCount: 0 },
        $inc: { eventCount: 1 },
      },
      { new: true, upsert: true },
    ).lean();
    return toErrorIncident(one(doc, "Error incident upsert"));
  }

  async list(organizationId?: string | null): Promise<ErrorIncident[]> {
    const docs = await ErrorIncidentModel.find(maybeOrganization(organizationId)).sort({ lastOccurrenceAt: -1 }).limit(100).lean();
    return docs.map(toErrorIncident);
  }
}

export class MongoRateLimitRuleRepository implements RateLimitRuleRepository {
  async list(organizationId?: string | null): Promise<any[]> {
    return RateLimitRuleModel.find(maybeOrganization(organizationId)).sort({ createdAt: -1 }).lean();
  }

  async create(input: any): Promise<any> {
    return RateLimitRuleModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) });
  }
}

export class MongoRateLimitStateRepository implements RateLimitStateRepository {
  async increment(input: Omit<RateLimitState, "id" | "count" | "createdAt" | "updatedAt">): Promise<RateLimitState> {
    const doc = await RateLimitStateModel.findOneAndUpdate(
      { organizationId: nullableOrganization(input.organizationId), scope: input.scope, subjectId: input.subjectId },
      { $setOnInsert: { ...input, organizationId: nullableOrganization(input.organizationId) }, $inc: { count: 1 } },
      { new: true, upsert: true },
    ).lean();
    const value = one(doc, "Rate limit increment");
    return {
      id: String(value._id),
      organizationId: asId(value.organizationId),
      scope: value.scope,
      subjectId: String(value.subjectId),
      count: Number(value.count ?? 0),
      resetAt: asDate(value.resetAt),
      createdAt: asDate(value.createdAt),
      updatedAt: asDate(value.updatedAt),
    };
  }
}

export class MongoRetryPolicyRepository implements RetryPolicyRepository {
  async list(organizationId?: string | null): Promise<RetryPolicy[]> {
    const docs = await RetryPolicyModel.find(maybeOrganization(organizationId)).sort({ provider: 1 }).lean();
    return docs.map(toRetryPolicy);
  }

  async upsert(input: Omit<RetryPolicy, "id" | "createdAt" | "updatedAt">): Promise<RetryPolicy> {
    const doc = await RetryPolicyModel.findOneAndUpdate(
      { organizationId: nullableOrganization(input.organizationId), provider: input.provider },
      { $set: { ...input, organizationId: nullableOrganization(input.organizationId) } },
      { new: true, upsert: true },
    ).lean();
    return toRetryPolicy(one(doc, "Retry policy upsert"));
  }
}

export class MongoCircuitBreakerRepository implements CircuitBreakerRepository {
  async list(organizationId?: string | null): Promise<CircuitBreaker[]> {
    const docs = await CircuitBreakerModel.find(maybeOrganization(organizationId)).sort({ provider: 1 }).lean();
    return docs.map(toCircuitBreaker);
  }

  async upsert(input: Omit<CircuitBreaker, "id" | "createdAt" | "updatedAt">): Promise<CircuitBreaker> {
    const doc = await CircuitBreakerModel.findOneAndUpdate(
      { organizationId: nullableOrganization(input.organizationId), provider: input.provider },
      { $set: { ...input, organizationId: nullableOrganization(input.organizationId) } },
      { new: true, upsert: true },
    ).lean();
    return toCircuitBreaker(one(doc, "Circuit breaker upsert"));
  }
}

export class MongoFallbackStrategyRepository implements FallbackStrategyRepository {
  async list(organizationId?: string | null): Promise<FallbackStrategy[]> {
    const docs = await FallbackStrategyModel.find(maybeOrganization(organizationId)).sort({ provider: 1 }).lean();
    return docs.map(toFallbackStrategy);
  }

  async upsert(input: Omit<FallbackStrategy, "id" | "createdAt" | "updatedAt">): Promise<FallbackStrategy> {
    const doc = await FallbackStrategyModel.findOneAndUpdate(
      { organizationId: nullableOrganization(input.organizationId), provider: input.provider },
      { $set: { ...input, organizationId: nullableOrganization(input.organizationId) } },
      { new: true, upsert: true },
    ).lean();
    return toFallbackStrategy(one(doc, "Fallback strategy upsert"));
  }
}

export class MongoDistributedLockRepository implements DistributedLockRepository {
  async acquire(input: Omit<DistributedLock, "id" | "releasedAt" | "createdAt" | "updatedAt">): Promise<DistributedLock | null> {
    const now = new Date();
    const doc = await DistributedLockModel.findOneAndUpdate(
      {
        organizationId: nullableOrganization(input.organizationId),
        lockKey: input.lockKey,
        $or: [{ releasedAt: { $ne: null } }, { expiresAt: { $lte: now } }, { releasedAt: null, expiresAt: { $exists: false } }],
      },
      { $set: { ...input, organizationId: nullableOrganization(input.organizationId), releasedAt: null } },
      { new: true, upsert: true },
    ).lean();
    return doc && !Array.isArray(doc) ? toDistributedLock(doc) : null;
  }

  async release(lockKey: string, ownerId: string): Promise<DistributedLock | null> {
    const doc = await DistributedLockModel.findOneAndUpdate({ lockKey, ownerId, releasedAt: null }, { $set: { releasedAt: new Date() } }, { new: true }).lean();
    return doc && !Array.isArray(doc) ? toDistributedLock(doc) : null;
  }

  async list(organizationId?: string | null): Promise<DistributedLock[]> {
    const docs = await DistributedLockModel.find(maybeOrganization(organizationId)).sort({ acquiredAt: -1 }).limit(100).lean();
    return docs.map(toDistributedLock);
  }
}

export class MongoAlertRuleRepository implements AlertRuleRepository {
  async list(organizationId?: string | null): Promise<AlertRule[]> {
    const docs = await AlertRuleModel.find(maybeOrganization(organizationId)).sort({ createdAt: -1 }).lean();
    return docs.map(toAlertRule);
  }

  async create(input: Omit<AlertRule, "id" | "createdAt" | "updatedAt">): Promise<AlertRule> {
    return toAlertRule(await AlertRuleModel.create({ ...input, organizationId: nullableOrganization(input.organizationId) }));
  }
}

export class MongoAlertEventRepository implements AlertEventRepository {
  async create(input: Omit<AlertEvent, "id" | "createdAt" | "updatedAt">): Promise<AlertEvent> {
    return toAlertEvent(await AlertEventModel.create({ ...input, organizationId: nullableOrganization(input.organizationId), ruleId: input.ruleId ? objectId(input.ruleId) : null }));
  }

  async list(organizationId?: string | null): Promise<AlertEvent[]> {
    const docs = await AlertEventModel.find(maybeOrganization(organizationId)).sort({ createdAt: -1 }).limit(100).lean();
    return docs.map(toAlertEvent);
  }
}
