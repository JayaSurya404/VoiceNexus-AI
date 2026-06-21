import mongoose, { Schema } from "mongoose";

const looseSchema = new Schema({}, { strict: false, timestamps: false });

export const ScheduledFollowupModel =
  (mongoose.models.WorkerScheduledFollowup ??
    mongoose.model("WorkerScheduledFollowup", looseSchema, "scheduledfollowups")) as mongoose.Model<any>;
export const WorkflowActionModel =
  (mongoose.models.WorkerWorkflowAction ??
    mongoose.model("WorkerWorkflowAction", looseSchema, "workflowactions")) as mongoose.Model<any>;
export const WorkflowExecutionModel =
  (mongoose.models.WorkerWorkflowExecution ??
    mongoose.model("WorkerWorkflowExecution", looseSchema, "workflowexecutions")) as mongoose.Model<any>;
export const ActionAuditModel =
  (mongoose.models.WorkerActionAudit ?? mongoose.model("WorkerActionAudit", looseSchema, "actionaudits")) as mongoose.Model<any>;
export const ActivityModel =
  (mongoose.models.WorkerActivity ?? mongoose.model("WorkerActivity", looseSchema, "activities")) as mongoose.Model<any>;
export const NoteModel = (mongoose.models.WorkerNote ?? mongoose.model("WorkerNote", looseSchema, "notes")) as mongoose.Model<any>;
export const LeadModel = (mongoose.models.WorkerLead ?? mongoose.model("WorkerLead", looseSchema, "leads")) as mongoose.Model<any>;
export const TimelineEventModel =
  (mongoose.models.WorkerTimelineEvent ??
    mongoose.model("WorkerTimelineEvent", looseSchema, "timelineevents")) as mongoose.Model<any>;
