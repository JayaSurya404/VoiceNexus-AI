export type ComplianceAlertType = "MISSING_DISCLOSURE" | "SCRIPT_VIOLATION" | "COMPLIANCE_RISK" | "ESCALATION_REQUIRED";

export interface ComplianceAlert {
  id: string;
  organizationId: string;
  coachingSessionId: string | null;
  agentId: string | null;
  conversationId: string | null;
  type: ComplianceAlertType;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  resolved: boolean;
  createdAt: Date;
}
