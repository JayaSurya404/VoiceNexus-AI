import type { ExternalActionRepository } from "../ports.js";

export class CrmActionService {
  constructor(private readonly externalActions: ExternalActionRepository) {}

  lookupLead(organizationId: string, leadId: string) {
    return this.externalActions.lookupLead({ organizationId, leadId });
  }

  updateLead(organizationId: string, leadId: string, input: Record<string, unknown>) {
    return this.externalActions.updateLead({ organizationId, leadId, update: safeLeadUpdate(input) });
  }

  updateContact(organizationId: string, leadId: string, input: Record<string, unknown>) {
    return this.externalActions.updateContact({ organizationId, leadId, update: safeContactUpdate(input) });
  }

  createNote(organizationId: string, leadId: string, content: string) {
    return this.externalActions.createNote({ organizationId, leadId, content });
  }

  createActivity(organizationId: string, leadId: string, type: string, title: string, description: string) {
    return this.externalActions.createActivity({ organizationId, leadId, type, title, description });
  }
}

function safeLeadUpdate(input: Record<string, unknown>): Record<string, unknown> {
  return pick(input, ["status", "score", "source", "firstName", "lastName", "email", "phone", "company", "language", "assignedTo"]);
}

function safeContactUpdate(input: Record<string, unknown>): Record<string, unknown> {
  return pick(input, ["email", "phone", "preferredLanguage", "timezone", "customerType"]);
}

function pick(input: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  return Object.fromEntries(keys.filter((key) => input[key] !== undefined).map((key) => [key, input[key]]));
}
