import type { ScheduledFollowupRepository } from "../ports.js";
import type { ScheduledFollowupPriority } from "../../domain/entities/scheduled-followup.js";
import { CrmActionService } from "./crm-action-service.js";

export class FollowupSchedulerService {
  constructor(
    private readonly followups: ScheduledFollowupRepository,
    private readonly crmActions: CrmActionService,
  ) {}

  async schedule(input: {
    organizationId: string;
    leadId: string;
    agentSessionId: string | null;
    conversationId: string | null;
    assignedTo?: string | null;
    timeframe?: string;
    reason: string;
    priority?: ScheduledFollowupPriority;
  }) {
    const followupDate = parseFollowupDate(input.timeframe);
    const followup = await this.followups.create({
      organizationId: input.organizationId,
      leadId: input.leadId,
      agentSessionId: input.agentSessionId,
      conversationId: input.conversationId,
      assignedTo: input.assignedTo ?? null,
      followupDate,
      reason: input.reason,
      priority: input.priority ?? "MEDIUM",
      status: "SCHEDULED",
    });
    await this.crmActions.createActivity(
      input.organizationId,
      input.leadId,
      "TASK",
      `Follow up ${input.timeframe ?? "soon"}`,
      input.reason,
    );
    return followup;
  }

  complete(id: string, organizationId: string) {
    return this.followups.complete(id, organizationId);
  }
}

function parseFollowupDate(timeframe: string | undefined): Date {
  const now = new Date();
  const text = (timeframe ?? "").toLowerCase();
  if (/next week/.test(text)) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (/tomorrow|next day/.test(text)) return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (/next month/.test(text)) return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}
