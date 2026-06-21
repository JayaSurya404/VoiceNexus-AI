import type { PlannedWorkflowAction, WorkflowExecutionRepository } from "../ports.js";
import type { AgentSession } from "../../domain/entities/agent-session.js";
import type { LeadQualification } from "../../domain/entities/lead-qualification.js";
import type { ActionExecutionService } from "./action-execution-service.js";
import type { FollowupDecision } from "./followup-decision-service.js";
import type { HandoffDecision } from "./human-handoff-service.js";
import type { ObjectionResult } from "./objection-handler-service.js";

export class WorkflowEngineService {
  constructor(
    private readonly workflows: WorkflowExecutionRepository,
    private readonly actionExecution: ActionExecutionService,
  ) {}

  async executeForTranscript(input: {
    organizationId: string;
    session: AgentSession;
    conversationId: string;
    leadId: string | null;
    transcript: string;
    qualification: LeadQualification | null;
    objection: ObjectionResult;
    followup: FollowupDecision;
    handoff: HandoffDecision;
  }) {
    const plannedActions = planActions(input);
    const workflow = await this.workflows.create({
      organizationId: input.organizationId,
      agentSessionId: input.session.id,
      conversationId: input.conversationId,
      leadId: input.leadId,
      trigger: "TRANSCRIPT_FINAL",
      status: "RUNNING",
      plannedActions: plannedActions.map((action) => action.actionType),
      completedActions: 0,
      failedActions: 0,
      reasoning: plannedActions.map((action) => action.reasoning).join(" | "),
      startedAt: new Date(),
      completedAt: null,
    });

    const results = [];
    for (const planned of plannedActions) {
      results.push(
        await this.actionExecution.execute(planned, {
          organizationId: input.organizationId,
          workflowExecutionId: workflow.id,
          agentSessionId: input.session.id,
          conversationId: input.conversationId,
          leadId: input.leadId,
        }),
      );
    }

    const completedActions = results.filter((action) => action.status === "SUCCEEDED" || action.status === "SKIPPED").length;
    const failedActions = results.filter((action) => action.status === "FAILED").length;
    await this.workflows.update(workflow.id, {
      status: failedActions > 0 && completedActions > 0 ? "PARTIAL" : failedActions > 0 ? "FAILED" : "COMPLETED",
      completedActions,
      failedActions,
      completedAt: new Date(),
    });

    return { workflow, actions: results };
  }
}

function planActions(input: {
  transcript: string;
  qualification: LeadQualification | null;
  objection: ObjectionResult;
  followup: FollowupDecision;
  handoff: HandoffDecision;
}): PlannedWorkflowAction[] {
  const text = input.transcript.toLowerCase();
  const actions: PlannedWorkflowAction[] = [];

  if (input.qualification) {
    actions.push({
      actionType: "CREATE_TIMELINE_EVENT",
      toolName: "createTimelineEvent",
      input: {
        eventType: "AI_QUALIFICATION",
        title: `AI qualification: ${input.qualification.interestLevel}`,
        description: input.qualification.qualificationReason,
        metadata: { score: input.qualification.score, confidence: input.qualification.confidence },
      },
      reasoning: "Persist AI qualification outcome to the customer timeline.",
      confidence: input.qualification.confidence,
    });
  }

  if (/number changed|new number|my phone|phone number/.test(text)) {
    actions.push({
      actionType: "UPDATE_LEAD",
      toolName: "updateLead",
      input: { phone: extractPhone(input.transcript) },
      reasoning: "Customer indicated a phone number change.",
      confidence: 0.72,
      condition: "phone_change_detected",
    });
    actions.push({
      actionType: "CREATE_NOTE",
      toolName: "createNote",
      input: { content: `Customer mentioned phone update: ${input.transcript}` },
      reasoning: "Record phone-change context for human review.",
      confidence: 0.76,
    });
  }

  if (input.followup.shouldSchedule) {
    actions.push({
      actionType: "SCHEDULE_FOLLOWUP",
      toolName: "scheduleFollowup",
      input: { timeframe: input.followup.suggestedTimeframe, reason: input.followup.reason },
      reasoning: input.followup.reason,
      confidence: input.followup.confidence,
    });
  }

  if (input.handoff.shouldHandoff) {
    actions.push({
      actionType: "TRIGGER_HANDOFF",
      toolName: "triggerHandoff",
      input: { reason: input.handoff.reason },
      reasoning: input.handoff.reason,
      confidence: input.handoff.confidence,
    });
  }

  if (input.objection.detected) {
    actions.push({
      actionType: "ADD_MEMORY",
      toolName: "createMemory",
      input: { summary: `Customer objection: ${input.objection.type}. Guidance: ${input.objection.responseGuidance}` },
      reasoning: "Persist objection signal for future conversations.",
      confidence: input.objection.confidence,
    });
  }

  if (!actions.length) {
    actions.push({
      actionType: "NO_ACTION",
      toolName: "noAction",
      input: {},
      reasoning: "No safe durable action detected from this transcript chunk.",
      confidence: 0.7,
    });
  }

  return actions;
}

function extractPhone(text: string): string {
  return text.match(/[+]?\d[\d\s().-]{6,}\d/)?.[0]?.trim() ?? "";
}
