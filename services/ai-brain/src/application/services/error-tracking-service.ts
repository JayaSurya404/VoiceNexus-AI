import { createHash } from "node:crypto";

import type { ErrorEvent, ErrorIncident, ErrorSeverity } from "../../domain/entities/error-event.js";
import type { ErrorEventRepository, ErrorFingerprintRepository, ErrorIncidentRepository } from "../ports.js";

const fingerprintFor = (service: string, message: string, stack: string | null) =>
  createHash("sha256").update(`${service}:${message}:${stack?.split("\n")[0] ?? ""}`).digest("hex").slice(0, 24);

export class ErrorTrackingService {
  constructor(
    private readonly errorEvents: ErrorEventRepository,
    private readonly errorFingerprints: ErrorFingerprintRepository,
    private readonly errorIncidents: ErrorIncidentRepository,
  ) {}

  async record(input: {
    organizationId?: string | null;
    service: string;
    message: string;
    stack?: string | null;
    severity?: ErrorSeverity;
    metadata?: Record<string, unknown>;
  }): Promise<ErrorEvent> {
    const now = new Date();
    const fingerprint = fingerprintFor(input.service, input.message, input.stack ?? null);
    const event = await this.errorEvents.create({
      organizationId: input.organizationId ?? null,
      service: input.service,
      fingerprint,
      message: input.message,
      stack: input.stack ?? null,
      severity: input.severity ?? "MEDIUM",
      metadata: input.metadata ?? {},
      occurredAt: now,
    });
    await this.errorFingerprints.upsert({
      organizationId: input.organizationId ?? null,
      fingerprint,
      message: input.message,
      service: input.service,
      frequency: 1,
      severity: input.severity ?? "MEDIUM",
      firstSeenAt: now,
      lastSeenAt: now,
      metadata: input.metadata ?? {},
    });
    await this.errorIncidents.upsert({
      organizationId: input.organizationId ?? null,
      fingerprint,
      title: input.message,
      status: "OPEN",
      severity: input.severity ?? "MEDIUM",
      eventCount: 1,
      firstOccurrenceAt: now,
      lastOccurrenceAt: now,
      assigneeId: null,
      metadata: input.metadata ?? {},
    });
    return event;
  }

  async list(organizationId: string | null = null): Promise<ErrorEvent[]> {
    return this.errorEvents.list(organizationId);
  }

  async incidents(organizationId: string | null = null): Promise<ErrorIncident[]> {
    return this.errorIncidents.list(organizationId);
  }
}
