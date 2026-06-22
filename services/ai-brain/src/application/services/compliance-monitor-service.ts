import { randomUUID } from "node:crypto";
import type { ComplianceAlert } from "../../domain/entities/compliance-alert.js";
import type { ComplianceAlertRepository } from "../coaching-ports.js";

export interface ComplianceMonitorInput {
  organizationId: string;
  coachingSessionId: string;
  agentId: string;
  conversationId?: string;
  transcript: string;
}

export class ComplianceMonitorService {
  constructor(private readonly alerts: ComplianceAlertRepository) {}

  async monitor(input: ComplianceMonitorInput): Promise<ComplianceAlert[]> {
    const normalized = input.transcript.toLowerCase();
    const detected: Array<Pick<ComplianceAlert, "type" | "severity" | "message">> = [];

    if (!/(recorded|recording|consent)/.test(normalized)) {
      detected.push({
        type: "MISSING_DISCLOSURE",
        severity: "HIGH",
        message: "Recording or consent disclosure was not detected in the conversation."
      });
    }

    if (/(guarantee|guaranteed result|no risk)/.test(normalized)) {
      detected.push({
        type: "SCRIPT_VIOLATION",
        severity: "CRITICAL",
        message: "Potential prohibited guarantee language detected."
      });
    }

    if (/(legal|lawsuit|regulator|complaint)/.test(normalized)) {
      detected.push({
        type: "ESCALATION_REQUIRED",
        severity: "HIGH",
        message: "Escalation recommended because legal or complaint language was detected."
      });
    }

    const now = new Date();
    const alerts = await Promise.all(
      detected.map((alert: Pick<ComplianceAlert, "type" | "severity" | "message">) => {
        const payload: ComplianceAlert = {
          id: randomUUID(),
          organizationId: input.organizationId,
          coachingSessionId: input.coachingSessionId,
          agentId: input.agentId,
          conversationId: input.conversationId ?? null,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          resolved: false,
          createdAt: now
        };

        return this.alerts.create(payload);
      })
    );

    return alerts;
  }

  list(organizationId: string): Promise<ComplianceAlert[]> {
    return this.alerts.listByOrganization(organizationId);
  }

  get(organizationId: string, id: string): Promise<ComplianceAlert | null> {
    return this.alerts.findById(organizationId, id);
  }
}
