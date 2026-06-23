import type { AuditLog } from "../../domain/entities/audit-log.js";
import type { AuditLogRepository } from "../ports.js";

export class AuditLogService {
  constructor(private readonly auditLogs: AuditLogRepository) {}

  async list(organizationId: string): Promise<AuditLog[]> {
    return this.auditLogs.listByOrganization(organizationId);
  }
}
