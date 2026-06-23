export interface OrganizationSettings {
  id: string;
  organizationId: string;
  defaultLocale: string;
  timezone: string;
  dataRetentionDays: number;
  allowedDomains: string[];
  security: {
    ssoRequired: boolean;
    mfaRequired: boolean;
    apiKeyRotationDays: number;
  };
  notifications: {
    billingAlerts: boolean;
    usageAlerts: boolean;
    auditAlerts: boolean;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
