import type { PlannedWorkflowAction, WorkflowActionRepository } from "../ports.js";
import type { WorkflowAction } from "../../domain/entities/workflow-action.js";
import { AuditService } from "./audit-service.js";
import { CrmActionService } from "./crm-action-service.js";
import { FollowupSchedulerService } from "./followup-scheduler-service.js";
import { MemoryActionService } from "./memory-action-service.js";
import { TimelineActionService } from "./timeline-action-service.js";

export interface ActionExecutionContext {
  organizationId: string;
  workflowExecutionId: string;
  agentSessionId: string | null;
  conversationId: string | null;
  leadId: string | null;
}

export class ActionExecutionService {
  constructor(
    private readonly actions: WorkflowActionRepository,
    private readonly crmActions: CrmActionService,
    private readonly memoryActions: MemoryActionService,
    private readonly timelineActions: TimelineActionService,
    private readonly followupScheduler: FollowupSchedulerService,
    private readonly audit: AuditService,
  ) {}

  async execute(planned: PlannedWorkflowAction, context: ActionExecutionContext): Promise<WorkflowAction> {
    const action = await this.actions.create({
      organizationId: context.organizationId,
      workflowExecutionId: context.workflowExecutionId,
      agentSessionId: context.agentSessionId,
      conversationId: context.conversationId,
      leadId: context.leadId,
      actionType: planned.actionType,
      toolName: planned.toolName,
      input: planned.input,
      output: {},
      status: "RUNNING",
      reasoning: planned.reasoning,
      confidence: planned.confidence,
      error: null,
    });

    try {
      const output = await this.executeAction(planned, context);
      const updated = await this.actions.update(action.id, {
        status: planned.actionType === "NO_ACTION" ? "SKIPPED" : "SUCCEEDED",
        output,
        error: null,
      });
      await this.audit.record({
        organizationId: context.organizationId,
        sessionId: context.agentSessionId,
        conversationId: context.conversationId,
        workflowExecutionId: context.workflowExecutionId,
        workflowActionId: action.id,
        actionType: planned.actionType,
        toolName: planned.toolName,
        input: planned.input,
        output,
        status: planned.actionType === "NO_ACTION" ? "SKIPPED" : "SUCCESS",
        reasoning: planned.reasoning,
        confidence: planned.confidence,
      });
      return updated ?? action;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Action failed";
      const updated = await this.actions.update(action.id, { status: "FAILED", output: {}, error: message });
      await this.audit.record({
        organizationId: context.organizationId,
        sessionId: context.agentSessionId,
        conversationId: context.conversationId,
        workflowExecutionId: context.workflowExecutionId,
        workflowActionId: action.id,
        actionType: planned.actionType,
        toolName: planned.toolName,
        input: planned.input,
        output: { error: message },
        status: "FAILED",
        reasoning: planned.reasoning,
        confidence: planned.confidence,
      });
      return updated ?? action;
    }
  }

  private async executeAction(planned: PlannedWorkflowAction, context: ActionExecutionContext): Promise<Record<string, unknown>> {
    const leadId = context.leadId;
    if (!leadId && planned.actionType !== "NO_ACTION") {
      return { skipped: true, reason: "No lead linked to this action." };
    }

    switch (planned.actionType) {
      case "CREATE_NOTE":
        return (await this.crmActions.createNote(context.organizationId, leadId!, text(planned.input.content))) ?? {};
      case "CREATE_ACTIVITY":
        return (await this.crmActions.createActivity(
          context.organizationId,
          leadId!,
          text(planned.input.type, "TASK"),
          text(planned.input.title, "AI action"),
          text(planned.input.description),
        )) ?? {};
      case "UPDATE_LEAD":
        return (await this.crmActions.updateLead(context.organizationId, leadId!, planned.input)) ?? {};
      case "UPDATE_CONTACT":
        return (await this.crmActions.updateContact(context.organizationId, leadId!, planned.input)) ?? {};
      case "ADD_MEMORY":
        return (await this.memoryActions.createMemory(context.organizationId, leadId!, text(planned.input.summary), "AI_ACTION")) ?? {};
      case "UPDATE_PREFERENCE":
        return (await this.memoryActions.updatePreference(context.organizationId, leadId!, planned.input)) ?? {};
      case "CREATE_TIMELINE_EVENT":
        return (await this.timelineActions.createEvent({
          organizationId: context.organizationId,
          leadId: leadId!,
          eventType: text(planned.input.eventType, "AI_ACTION"),
          title: text(planned.input.title, "AI action"),
          description: text(planned.input.description),
          metadata: isRecord(planned.input.metadata) ? planned.input.metadata : {},
        })) ?? {};
      case "SCHEDULE_FOLLOWUP":
        return (await this.followupScheduler.schedule({
          organizationId: context.organizationId,
          leadId: leadId!,
          agentSessionId: context.agentSessionId,
          conversationId: context.conversationId,
          timeframe: text(planned.input.timeframe, "within 24 hours"),
          reason: text(planned.input.reason, planned.reasoning),
          priority: "MEDIUM",
        })) as unknown as Record<string, unknown>;
      case "TRIGGER_HANDOFF":
        return (await this.timelineActions.createEvent({
          organizationId: context.organizationId,
          leadId: leadId!,
          eventType: "HUMAN_HANDOFF",
          title: "Human handoff requested",
          description: text(planned.input.reason, planned.reasoning),
          metadata: { confidence: planned.confidence },
        })) ?? {};
      case "NO_ACTION":
        return { skipped: true, reason: planned.reasoning };
    }
  }
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
