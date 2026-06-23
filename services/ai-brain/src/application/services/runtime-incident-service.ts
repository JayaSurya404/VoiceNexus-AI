import type { RuntimeIncident } from "../../domain/entities/runtime-orchestration.js";
import type { MongoRuntimeIncidentRepository } from "../../infrastructure/database/mongoose/repositories/runtime-orchestration-repositories.js";
import type { RuntimeRealtimeEventService } from "./runtime-realtime-event-service.js";

export interface RuntimeIncidentInput {
  organizationId: string;
  sessionId?: string;
  severity: RuntimeIncident["severity"];
  category: RuntimeIncident["category"];
  message: string;
}

export class RuntimeIncidentService {
  public constructor(
    private readonly incidents: MongoRuntimeIncidentRepository,
    private readonly realtime: RuntimeRealtimeEventService
  ) {}

  public async create(input: RuntimeIncidentInput): Promise<RuntimeIncident> {
    const incident = await this.incidents.create(input);
    await this.realtime.publish(input.organizationId, "runtime.incident.created", { incident });
    return incident;
  }

  public listByOrganization(organizationId: string): Promise<RuntimeIncident[]> {
    return this.incidents.listByOrganization(organizationId);
  }
}
