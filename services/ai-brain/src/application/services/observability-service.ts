import { randomUUID } from "node:crypto";

import type { EventLog, Span, Trace } from "../../domain/entities/trace.js";
import type { EventLogRepository, SpanRepository, TraceRepository } from "../ports.js";

export class ObservabilityService {
  constructor(
    private readonly traces: TraceRepository,
    private readonly spans: SpanRepository,
    private readonly eventLogs: EventLogRepository,
  ) {}

  async startTrace(input: {
    organizationId?: string | null;
    name: string;
    attributes?: Record<string, unknown>;
  }): Promise<Trace> {
    return this.traces.create({
      organizationId: input.organizationId ?? null,
      traceId: randomUUID(),
      rootSpanId: null,
      name: input.name,
      status: "OK",
      startedAt: new Date(),
      endedAt: null,
      durationMs: null,
      attributes: input.attributes ?? {},
    });
  }

  async recordSpan(input: Omit<Span, "id" | "createdAt" | "updatedAt">): Promise<Span> {
    return this.spans.create(input);
  }

  async recordEvent(input: Omit<EventLog, "id" | "createdAt" | "updatedAt">): Promise<EventLog> {
    return this.eventLogs.create(input);
  }

  async listTraces(organizationId: string | null = null): Promise<Trace[]> {
    return this.traces.list(organizationId);
  }

  async listEvents(organizationId: string | null = null): Promise<EventLog[]> {
    return this.eventLogs.list(organizationId);
  }
}
