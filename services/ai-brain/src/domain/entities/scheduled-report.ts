export type ScheduledReportFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";

export interface ScheduledReport {
  id: string;
  organizationId: string;
  templateId: string | null;
  name: string;
  frequency: ScheduledReportFrequency;
  recipients: string[];
  nextRunAt: Date;
  lastRunAt: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
