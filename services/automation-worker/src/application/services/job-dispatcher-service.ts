import type { JobSchedule } from "../../domain/entities/job-schedule.js";
import type { SharedWorkflowRepository, WorkerActionRepository } from "../ports.js";

export class JobDispatcherService {
  constructor(
    private readonly sharedWorkflow: SharedWorkflowRepository,
    private readonly actions: WorkerActionRepository,
  ) {}

  async dispatch(schedule: JobSchedule): Promise<Record<string, unknown>> {
    if (schedule.jobType === "FOLLOWUP") return this.executeFollowup(schedule);
    if (schedule.jobType === "WORKFLOW_ACTION") return this.executeWorkflowAction(schedule);
    return { skipped: true, reason: "Workflow execution job does not require dispatch in this phase." };
  }

  private async executeFollowup(schedule: JobSchedule): Promise<Record<string, unknown>> {
    const due = (await this.sharedWorkflow.findDueFollowups(new Date(Date.now() + 1_000), 500)).find(
      (followup) => followup.id === schedule.sourceId,
    );

    if (!due) {
      return { skipped: true, reason: "Follow-up is no longer due." };
    }

    const activity = await this.actions.createCrmActivity({
      organizationId: due.organizationId,
      leadId: due.leadId,
      type: "TASK",
      title: "Scheduled AI follow-up due",
      description: due.reason,
    });
    const timeline = await this.actions.createTimelineEvent({
      organizationId: due.organizationId,
      leadId: due.leadId,
      eventType: "FOLLOW_UP_CREATED",
      title: "Scheduled follow-up executed",
      description: due.reason,
      metadata: { jobScheduleId: schedule.id, priority: due.priority },
    });
    await this.actions.createNote({
      organizationId: due.organizationId,
      leadId: due.leadId,
      content: `Automation worker executed scheduled follow-up: ${due.reason}`,
    });
    await this.sharedWorkflow.completeFollowup(due.id, due.organizationId);

    return { activity, timeline, followupCompleted: true };
  }

  private async executeWorkflowAction(schedule: JobSchedule): Promise<Record<string, unknown>> {
    const action = (await this.sharedWorkflow.findRetryableWorkflowActions(500)).find((item) => item.id === schedule.sourceId);

    if (!action || !action.leadId) {
      return { skipped: true, reason: "Workflow action is no longer executable." };
    }

    let output: Record<string, unknown>;
    switch (action.actionType) {
      case "CREATE_NOTE":
        output = await this.actions.createNote({ organizationId: action.organizationId, leadId: action.leadId, content: text(action.input.content, action.reasoning) });
        break;
      case "CREATE_ACTIVITY":
        output = await this.actions.createCrmActivity({
          organizationId: action.organizationId,
          leadId: action.leadId,
          type: text(action.input.type, "TASK"),
          title: text(action.input.title, "AI workflow action"),
          description: text(action.input.description, action.reasoning),
        });
        break;
      case "UPDATE_LEAD":
        output = await this.actions.updateLead({ organizationId: action.organizationId, leadId: action.leadId, update: action.input });
        break;
      case "CREATE_TIMELINE_EVENT":
      case "TRIGGER_HANDOFF":
        output = await this.actions.createTimelineEvent({
          organizationId: action.organizationId,
          leadId: action.leadId,
          eventType: text(action.input.eventType, action.actionType === "TRIGGER_HANDOFF" ? "HUMAN_HANDOFF" : "AI_ACTION"),
          title: text(action.input.title, action.actionType),
          description: text(action.input.description ?? action.input.reason, action.reasoning),
          metadata: { jobScheduleId: schedule.id },
        });
        break;
      default:
        output = { skipped: true, reason: `Worker does not execute ${action.actionType}; action remains audited.` };
    }

    await this.sharedWorkflow.updateWorkflowAction(action.id, { status: "SUCCEEDED", output, error: null });
    await this.sharedWorkflow.updateWorkflowExecutionFromActions(action.workflowExecutionId);
    return output;
  }
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}
