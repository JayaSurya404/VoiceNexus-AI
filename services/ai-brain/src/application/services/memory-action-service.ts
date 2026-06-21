import type { ExternalActionRepository } from "../ports.js";

export class MemoryActionService {
  constructor(private readonly externalActions: ExternalActionRepository) {}

  lookupMemory(organizationId: string, leadId: string) {
    return this.externalActions.lookupMemory({ organizationId, leadId });
  }

  createMemory(organizationId: string, leadId: string, summary: string, source = "AI_ACTION") {
    return this.externalActions.createMemory({ organizationId, leadId, summary, source });
  }

  updatePreference(organizationId: string, leadId: string, input: Record<string, unknown>) {
    return this.externalActions.updatePreference({
      organizationId,
      leadId,
      update: pick(input, ["language", "timezone", "preferredContactTime", "communicationStyle"]),
    });
  }
}

function pick(input: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(keys.filter((key) => input[key] !== undefined).map((key) => [key, input[key]]));
}
