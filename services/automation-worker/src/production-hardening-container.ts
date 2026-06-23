import {
  AutomationWorkerProductionHardeningService,
  type RedisLockClient,
} from "./application/services/production-hardening-service.js";

export interface AutomationWorkerProductionHardeningContainer {
  productionHardening: AutomationWorkerProductionHardeningService;
}

export function createAutomationWorkerProductionHardeningContainer(
  redis: RedisLockClient | null = null,
): AutomationWorkerProductionHardeningContainer {
  return {
    productionHardening: new AutomationWorkerProductionHardeningService(redis),
  };
}
