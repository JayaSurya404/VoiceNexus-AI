import type {
  CallRuntimeSession,
  RuntimeHealthSnapshot
} from "../../domain/entities/runtime-orchestration.js";
import type {
  MongoRuntimeFallbackEventRepository,
  MongoRuntimeIncidentRepository,
  MongoRuntimeSessionRepository
} from "../../infrastructure/database/mongoose/repositories/runtime-orchestration-repositories.js";
import type { InfrastructureStatusService } from "./infrastructure-status-service.js";
import type { ProviderRuntimeSelectionService } from "./provider-runtime-selection-service.js";
import type { ProviderRegistryService } from "./provider-registry-service.js";

export class RuntimeMonitoringService {
  public constructor(
    private readonly sessions: MongoRuntimeSessionRepository,
    private readonly fallbackEvents: MongoRuntimeFallbackEventRepository,
    private readonly incidents: MongoRuntimeIncidentRepository,
    private readonly providers: ProviderRegistryService,
    private readonly providerRuntime: ProviderRuntimeSelectionService,
    private readonly infrastructureStatus: InfrastructureStatusService
  ) {}

  public async overview(organizationId: string): Promise<RuntimeHealthSnapshot> {
    const [activeSessions, providerStatuses, fallbackEvents, incidents, infrastructure, selection] = await Promise.all([
      this.sessions.countActive(organizationId),
      this.providers.status(),
      this.fallbackEvents.listByOrganization(organizationId, 25),
      this.incidents.listByOrganization(organizationId, 25),
      this.infrastructureStatus.status(),
      this.providerRuntime.select(organizationId)
    ]);

    return {
      organizationId,
      activeSessions,
      activeProvider: selection.provider,
      providerStatuses,
      fallbackEvents,
      incidents,
      dependencies: {
        providersReady: providerStatuses.some((provider) => provider.ready),
        twilioReady: infrastructure.twilio.ready,
        redisReady: infrastructure.redis.ready,
        mongoReady: infrastructure.mongo.ready
      },
      capturedAt: new Date()
    };
  }

  public listSessions(organizationId: string): Promise<CallRuntimeSession[]> {
    return this.sessions.listByOrganization(organizationId);
  }
}
