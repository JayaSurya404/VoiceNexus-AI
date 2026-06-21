import type { ActionAuditRepository } from "../ports.js";
import type { ActionAudit } from "../../domain/entities/action-audit.js";

export class AuditService {
  constructor(private readonly audits: ActionAuditRepository) {}

  record(input: Omit<ActionAudit, "id" | "createdAt">): Promise<ActionAudit> {
    return this.audits.create({ ...input, createdAt: new Date() });
  }
}
