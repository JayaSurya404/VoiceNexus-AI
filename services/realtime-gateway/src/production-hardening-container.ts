import { RealtimeProductionHardeningService, type RedisLockClient } from "./application/services/production-hardening-service.js";

export interface RealtimeProductionHardeningContainer {
  productionHardening: RealtimeProductionHardeningService;
}

export function createRealtimeProductionHardeningContainer(
  redis: RedisLockClient | null = null,
): RealtimeProductionHardeningContainer {
  return {
    productionHardening: new RealtimeProductionHardeningService(redis),
  };
}
