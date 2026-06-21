import type { ToolExecutionRepository } from "../application/ports.js";
import type { ProviderToolCall, ProviderToolDefinition } from "../providers/ai-provider.js";
import { ActivityModel, CustomerMemoryModel, LeadModel, NoteModel, TimelineEventModel } from "../infrastructure/database/mongoose/models/external-models.js";
import { objectId, objectIdOrThrow } from "../infrastructure/database/mongoose/repositories/repository-utils.js";

export interface ToolExecutionContext {
  organizationId: string;
  leadId: string | null;
  conversationId: string | null;
  agentSessionId: string | null;
}

export class ToolRouter {
  constructor(private readonly executions: ToolExecutionRepository) {}

  definitions(): ProviderToolDefinition[] {
    return [
      tool("lookupLead", "Lookup the active CRM lead.", { type: "object", additionalProperties: false, properties: {}, required: [] }),
      tool("updateLead", "Update CRM lead status, score, or key fields.", {
        type: "object",
        additionalProperties: false,
        properties: {
          status: { type: "string" },
          score: { type: "number" },
          source: { type: "string" },
        },
        required: [],
      }),
      tool("createNote", "Create an organization-scoped lead note.", {
        type: "object",
        additionalProperties: false,
        properties: { content: { type: "string" } },
        required: ["content"],
      }),
      tool("createActivity", "Create an organization-scoped CRM activity.", {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string", enum: ["CALL", "WHATSAPP", "EMAIL", "NOTE", "TASK", "MEETING"] },
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["type", "title", "description"],
      }),
      tool("lookupMemory", "Lookup durable customer memory and timeline context.", {
        type: "object",
        additionalProperties: false,
        properties: {},
        required: [],
      }),
      tool("scheduleFollowup", "Persist a follow-up task activity without sending any message.", {
        type: "object",
        additionalProperties: false,
        properties: {
          timeframe: { type: "string" },
          reason: { type: "string" },
        },
        required: ["timeframe", "reason"],
      }),
    ];
  }

  async execute(call: ProviderToolCall, context: ToolExecutionContext): Promise<void> {
    const executedAt = new Date();
    try {
      const output = await this.executeTool(call.name, call.arguments, context);
      await this.executions.create({
        conversationId: context.conversationId,
        agentSessionId: context.agentSessionId,
        toolName: call.name,
        input: call.arguments,
        output,
        success: true,
        error: null,
        executedAt,
      });
    } catch (error) {
      await this.executions.create({
        conversationId: context.conversationId,
        agentSessionId: context.agentSessionId,
        toolName: call.name,
        input: call.arguments,
        output: {},
        success: false,
        error: error instanceof Error ? error.message : "Tool execution failed",
        executedAt,
      });
    }
  }

  private async executeTool(name: string, input: Record<string, unknown>, context: ToolExecutionContext): Promise<Record<string, unknown>> {
    if (!context.leadId && name !== "lookupMemory") {
      return { skipped: true, reason: "No lead is linked to this call." };
    }

    const organizationId = objectIdOrThrow(context.organizationId);
    const leadId = objectId(context.leadId);

    switch (name) {
      case "lookupLead": {
        const lead = await LeadModel.findOne({ _id: leadId, organizationId }).lean();
        return { lead: serialize(lead) };
      }
      case "updateLead": {
        const update = Object.fromEntries(
          Object.entries({
            status: typeof input.status === "string" ? input.status : undefined,
            score: typeof input.score === "number" ? input.score : undefined,
            source: typeof input.source === "string" ? input.source : undefined,
            lastActivityAt: new Date(),
          }).filter(([, value]) => value !== undefined),
        );
        const lead = await LeadModel.findOneAndUpdate({ _id: leadId, organizationId }, update, { new: true }).lean();
        return { lead: serialize(lead), updated: Boolean(lead) };
      }
      case "createNote": {
        const note = await NoteModel.create({
          organizationId,
          leadId,
          content: String(input.content ?? ""),
          createdBy: null,
          createdAt: new Date(),
        });
        return { noteId: note._id.toString() };
      }
      case "createActivity": {
        const activity = await ActivityModel.create({
          organizationId,
          leadId,
          type: typeof input.type === "string" ? input.type : "TASK",
          title: String(input.title ?? "AI runtime activity"),
          description: String(input.description ?? ""),
          createdBy: null,
          createdAt: new Date(),
        });
        return { activityId: activity._id.toString() };
      }
      case "lookupMemory": {
        const [memories, timeline] = await Promise.all([
          leadId ? CustomerMemoryModel.find({ organizationId, leadId }).sort({ updatedAt: -1 }).limit(5).lean() : [],
          leadId ? TimelineEventModel.find({ organizationId, leadId }).sort({ createdAt: -1 }).limit(5).lean() : [],
        ]);
        return { memories: memories.map(serialize), timeline: timeline.map(serialize) };
      }
      case "scheduleFollowup": {
        const activity = await ActivityModel.create({
          organizationId,
          leadId,
          type: "TASK",
          title: `Follow up ${String(input.timeframe ?? "soon")}`,
          description: String(input.reason ?? "AI runtime requested a follow-up."),
          createdBy: null,
          createdAt: new Date(),
        });
        return { activityId: activity._id.toString(), scheduled: true };
      }
      default:
        return { skipped: true, reason: `Unsupported tool ${name}` };
    }
  }
}

function tool(name: string, description: string, parameters: Record<string, unknown>): ProviderToolDefinition {
  return { name, description, parameters };
}

function serialize(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}
